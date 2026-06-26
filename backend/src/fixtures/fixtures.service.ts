import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { SportMonksService } from '@/sportmonks/sportmonks.service.js';
import { CacheService } from '@/cache/cache.service.js';
import { MatchTextService } from '@/llm/match-text.service.js';
import { MatchChatService, ChatMessage } from '@/llm/match-chat.service.js';
import { MatchStatus } from '../../generated/prisma/index.js';

const MATCH_INCLUDE = {
  home_team: { select: { id: true, name: true, short_name: true, logo_url: true } },
  away_team: { select: { id: true, name: true, short_name: true, logo_url: true } },
  season: { include: { league: { select: { id: true, name: true, logo_url: true } } } },
} as const;

const FEATURED_INCLUDE = {
  home_team: { select: { id: true, name: true, short_name: true, logo_url: true } },
  away_team: { select: { id: true, name: true, short_name: true, logo_url: true } },
  season: {
    include: {
      league: { select: { id: true, name: true, logo_url: true, api_football_id: true } },
    },
  },
  statistics: {
    select: {
      team_id:         true,
      possession:      true,
      shots:           true,
      shots_on_target: true,
      xg:              true,
      corners:         true,
      fouls:           true,
      yellow_cards:    true,
      red_cards:       true,
    },
  },
} as const;

// Featured-match priority weight by SportMonks league ID
const LEAGUE_WEIGHT: Record<number, number> = {
  732: 10, 1107: 7, 8: 6, 564: 5, 384: 4, 82: 3,
  720: 2, 726: 2, 714: 1, 711: 1, 717: 1, 723: 1, 729: 1,
};

@Injectable()
export class FixturesService {
  constructor(
    private readonly prisma:     PrismaService,
    private readonly sportmonks: SportMonksService,
    private readonly cache:      CacheService,
    private readonly matchText:  MatchTextService,
    private readonly matchChat:  MatchChatService,
  ) {}

  // ── Narrative (LLM-authored, generate-once-lock-in — see docs §5) ──────────

  async getNarrative(matchId: string) {
    const data = await this.matchText.getOrGenerate(matchId);
    return { data };
  }

  // ── Commentary (play-by-play) ──────────────────────────────────────────────
  // Stored by the live sync; this just reads it back. For a finished match that
  // was never synced live (e.g. games from before this feature shipped), do a
  // one-time backfill so old match pages aren't blank.
  async getCommentary(matchId: string) {
    const match = await this.prisma.match.findFirst({
      where: /^\d+$/.test(matchId)
        ? { OR: [{ id: matchId }, { api_football_id: Number(matchId) }] }
        : { id: matchId },
      select: { id: true, api_football_id: true },
    });
    if (!match) return { data: [] };

    const have = await this.prisma.matchCommentary.count({ where: { match_id: match.id } });
    if (have === 0 && match.api_football_id) {
      await this.backfillCommentary(match.id, match.api_football_id);
    }

    const data = await this.prisma.matchCommentary.findMany({
      where:   { match_id: match.id },
      orderBy: { order: 'desc' },
      select: {
        id: true, minute: true, extra_minute: true, comment: true,
        is_goal: true, is_important: true, order: true, player_name: true,
      },
    });
    return { data };
  }

  private async backfillCommentary(matchId: string, apiId: number) {
    const raw = await this.sportmonks.getCommentariesByFixtureId(apiId);
    if (!raw?.length) return;
    await this.prisma.matchCommentary.createMany({
      data: (raw as any[]).map((c) => ({
        sportmonks_id: BigInt(c.id),
        match_id:      matchId,
        minute:        c.minute ?? null,
        extra_minute:  c.extra_minute ?? null,
        comment:       c.comment ?? '',
        is_goal:       !!c.is_goal,
        is_important:  !!c.is_important,
        order:         c.order ?? 0,
        player_name:   c.player?.display_name ?? c.player?.name ?? null,
      })),
      skipDuplicates: true,
    });
  }

  // ── Chat (signed-in only — see docs §9) ────────────────────────────────────

  async chat(matchId: string, messages: ChatMessage[]) {
    const reply = await this.matchChat.reply(matchId, messages);
    return { data: reply ? { reply } : null };
  }

  // ── Knockout bracket ──────────────────────────────────────────────────────────

  // Bracket structure changes slowly → cache the normalized result for 12h so we
  // hit SportMonks at most once per competition per half-day (shared across users).
  async getBracket(leagueId: string) {
    const data = await this.cache.getOrSet(
      `bracket:${leagueId}`,
      12 * 60 * 60 * 1000, // 12 hours
      () => this.buildBracket(leagueId),
    );
    return { data };
  }

  private async buildBracket(leagueId: string) {
    const league = await this.prisma.league.findUnique({
      where:   { id: leagueId },
      include: { seasons: { where: { is_current: true }, take: 1 } },
    });
    const seasonId = league?.seasons[0]?.sportmonks_id;
    if (!seasonId) return null;

    const raw = await this.sportmonks.getBrackets(seasonId);
    if (!raw?.stages?.length) return null;

    const stages = raw.stages.map((st: any) => ({
      id:   st.stage_id,
      name: st.stage_name,
      ties: (st.fixtures ?? []).map((f: any) => this.mapTie(f)),
    }));

    const edges = (raw.edges ?? []).map((e: any) => ({
      child:     e.child_fixture_id,
      childSlot: e.child_slot,       // 'home' | 'away'
      parent:    e.parent_fixture_id,
      outcome:   e.parent_outcome,   // 'winner' | 'loser'
    }));

    return { stages, edges };
  }

  // Map a SportMonks (bracket/placeholder) fixture into a compact tie shape
  private mapTie(f: any) {
    const [homeSlot, awaySlot] = String(f.name ?? '').split(' vs ');
    const parts = f.participants ?? [];
    const home  = parts.find((p: any) => p.meta?.location === 'home');
    const away  = parts.find((p: any) => p.meta?.location === 'away');
    return {
      id:          f.id,
      label:       f.details ?? null,
      date:        f.starting_at ?? null,
      placeholder: f.placeholder ?? true,
      homeSlot:    homeSlot ?? null,
      awaySlot:    awaySlot ?? null,
      homeTeam:    home ? { name: home.name, logo: home.image_path } : null,
      awayTeam:    away ? { name: away.name, logo: away.image_path } : null,
    };
  }

  // ── Match preview (placeholder fixtures not yet in our DB) ─────────────────────

  private async buildPreview(fixtureId: number) {
    const fx = await this.sportmonks.getFixturePreview(fixtureId);
    if (!fx) return null;

    // Prefer our stored Venue (rich: country, image); fall back to the live one.
    let venue: any = null;
    if (fx.venue_id) {
      venue = await this.prisma.venue.findUnique({
        where:  { sportmonks_id: fx.venue_id },
        ...this.VENUE_SELECT,
      });
    }
    if (!venue && fx.venue) {
      venue = {
        name:      fx.venue.name ?? null,
        city:      fx.venue.city_name ?? fx.venue.city?.name ?? null,
        country:   null,
        capacity:  fx.venue.capacity ?? null,
        surface:   fx.venue.surface ?? null,
        image_url: fx.venue.image_path ?? null,
      };
    }

    // Other fixtures in the same knockout round (from the bracket)
    let roundFixtures: any[] = [];
    if (fx.season_id && fx.stage_id) {
      const raw = await this.sportmonks.getBrackets(fx.season_id);
      const stage = raw?.stages?.find((s: any) => s.stage_id === fx.stage_id);
      roundFixtures = (stage?.fixtures ?? []).map((f: any) => this.mapTie(f));
    }

    return {
      preview:       true as const,
      ...this.mapTie(fx),
      name:          fx.name ?? null,
      venue,
      league:        fx.league ? { name: fx.league.name, logo: fx.league.image_path } : null,
      stage:         fx.stage?.name ?? null,   // e.g. "Round of 32"
      roundFixtures,
    };
  }

  // ── Team form ─────────────────────────────────────────────────────────────────
  // Reads from team_form table — pre-populated by SyncService.syncTeamForm().

  async getMatchForm(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where:  { id: matchId },
      select: { home_team_id: true, away_team_id: true },
    });
    if (!match) throw new NotFoundException('Match not found');

    const [home, away] = await Promise.all([
      this.getTeamRecentForm(match.home_team_id),
      this.getTeamRecentForm(match.away_team_id),
    ]);

    return { data: { home, away } };
  }

  private async getTeamRecentForm(teamId: string) {
    const rows = await this.prisma.teamForm.findMany({
      where:   { team_id: teamId },
      orderBy: { kickoff_at: 'desc' },
      take:    5,
      include: {
        team:     { select: { id: true, name: true, short_name: true, logo_url: true } },
        opponent: { select: { id: true, name: true, short_name: true, logo_url: true } },
      },
    });

    return rows.map(r => ({
      id:         r.id,
      home_team:  r.is_home ? r.team : r.opponent,
      away_team:  r.is_home ? r.opponent : r.team,
      home_score: r.home_score,
      away_score: r.away_score,
      kickoff_at: r.kickoff_at.toISOString(),
    }));
  }

  // ── Head-to-head ──────────────────────────────────────────────────────────────

  async getHeadToHead(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where:  { id: matchId },
      select: {
        home_team: { select: { api_football_id: true } },
        away_team: { select: { api_football_id: true } },
      },
    });
    if (!match) throw new NotFoundException('Match not found');

    const homeApiId = match.home_team.api_football_id;
    const awayApiId = match.away_team.api_football_id;
    if (!homeApiId || !awayApiId) return { data: null };

    const [a, b] = [homeApiId, awayApiId].sort((x, y) => x - y);
    const cached = await this.cache.get<{ rawMeetings: any[] }>(`h2h:${a}:${b}`);
    if (!cached?.rawMeetings) return { data: null };

    // Compute win/draw/loss tally relative to THIS fixture's home/away perspective
    let homeWins = 0, draws = 0, awayWins = 0;
    for (const m of cached.rawMeetings) {
      if (m.homeScore == null || m.awayScore == null) continue;
      const homeGoals = m.homeIsApiId === homeApiId ? m.homeScore : m.awayScore;
      const awayGoals = m.homeIsApiId === homeApiId ? m.awayScore : m.homeScore;
      if (homeGoals > awayGoals) homeWins++;
      else if (homeGoals < awayGoals) awayWins++;
      else draws++;
    }

    return {
      data: {
        meetings: cached.rawMeetings.slice(0, 10).map(({ homeIsApiId, ...m }: any) => m),
        summary:  { played: cached.rawMeetings.length, homeWins, draws, awayWins },
      },
    };
  }

  async findAll(query: {
    status?: MatchStatus; leagueId?: string; teamId?: string; date?: string;
    from?: string; to?: string;
  }) {
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.leagueId) where.season = { league_id: query.leagueId };
    if (query.teamId) {
      where.OR = [{ home_team_id: query.teamId }, { away_team_id: query.teamId }];
    }
    if (query.from && query.to) {
      // Exact UTC instants for the CLIENT's local calendar day (see
      // frontend lib/date-range.ts) — preferred over `date`, which can only
      // ever describe a UTC day server-side and drifts from what the
      // visitor actually means by "today" once their local day and the UTC
      // day disagree (i.e. for roughly |their UTC offset| hours every day).
      where.kickoff_at = { gte: new Date(query.from), lt: new Date(query.to) };
    } else if (query.date) {
      const [year, month, dayOfMonth] = query.date.split('-').map(Number);
      const day     = new Date(Date.UTC(year, month - 1, dayOfMonth));
      const nextDay = new Date(day);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      where.kickoff_at = { gte: day, lt: nextDay };
    }

    const matches = await this.prisma.match.findMany({
      where,
      include: MATCH_INCLUDE,
      orderBy: { kickoff_at: 'asc' },
    });

    return { data: matches };
  }

  async findToday(from?: string, to?: string) {
    // Prefer the client's exact local-day bounds (see findAll) — falls back
    // to a UTC day for callers that can't supply them (cron/admin scripts).
    let today: Date;
    let tomorrow: Date;
    if (from && to) {
      today = new Date(from);
      tomorrow = new Date(to);
    } else {
      const now = new Date();
      today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    }

    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { kickoff_at: { gte: today, lt: tomorrow } },
          { status: { in: [MatchStatus.LIVE, MatchStatus.HALFTIME, MatchStatus.INTERRUPTED] } },
        ],
      },
      include: MATCH_INCLUDE,
      orderBy: { kickoff_at: 'asc' },
    });

    return { data: matches };
  }

  async findLive() {
    const matches = await this.prisma.match.findMany({
      where: { status: { in: [MatchStatus.LIVE, MatchStatus.HALFTIME, MatchStatus.INTERRUPTED] } },
      include: MATCH_INCLUDE,
      orderBy: { kickoff_at: 'asc' },
    });
    return { data: matches };
  }

  async findUpcoming(leagueId?: string, limit = 10) {
    const where: any = {
      status:     'SCHEDULED',
      kickoff_at: { gte: new Date() },
    };
    if (leagueId) where.season = { league_id: leagueId };

    const matches = await this.prisma.match.findMany({
      where,
      include:  MATCH_INCLUDE,
      orderBy:  { kickoff_at: 'asc' },
      take:     limit,
    });
    return { data: matches };
  }

  async findFeatured() {
    // 1. Try live / halftime matches first
    const liveMatches = await this.prisma.match.findMany({
      where: { status: { in: [MatchStatus.LIVE, MatchStatus.HALFTIME, MatchStatus.INTERRUPTED] } },
      include: FEATURED_INCLUDE,
    });

    if (liveMatches.length > 0) {
      const scored = liveMatches.map((m) => {
        const apiId   = (m.season.league as any).api_football_id as number | null;
        const weight  = LEAGUE_WEIGHT[apiId ?? 0] ?? 0;
        const goals   = (m.home_score ?? 0) + (m.away_score ?? 0);
        const phase   = (m.minute ?? 0) > 45 ? 1 : 0;
        return { match: m, score: weight * 10 + goals * 2 + phase };
      });
      scored.sort((a, b) => b.score - a.score);
      return { data: { match: scored[0].match, type: 'live' as const } };
    }

    // 2. Fallback: next scheduled match from any active league
    const upcoming = await this.prisma.match.findFirst({
      where: {
        status:     MatchStatus.SCHEDULED,
        kickoff_at: { gte: new Date() },
        season:     { league: { is_active: true } },
      },
      orderBy: { kickoff_at: 'asc' },
      include: FEATURED_INCLUDE,
    });

    if (upcoming) {
      return { data: { match: upcoming, type: 'upcoming' as const } };
    }

    // 3. Last resort: most recent finished match
    const finished = await this.prisma.match.findFirst({
      where: {
        status: MatchStatus.FINISHED,
        season: { league: { is_active: true } },
      },
      orderBy: { kickoff_at: 'desc' },
      include: FEATURED_INCLUDE,
    });

    return { data: { match: finished ?? null, type: 'finished' as const } };
  }

  async findForSitemap() {
    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - 90);
    const until = new Date(now);
    until.setDate(until.getDate() + 60);

    const matches = await this.prisma.match.findMany({
      where: { kickoff_at: { gte: since, lte: until } },
      select: { id: true, updated_at: true },
      orderBy: { kickoff_at: 'desc' },
    });
    return { data: matches };
  }

  private readonly VENUE_SELECT = {
    select: {
      name: true, city: true, country: true,
      capacity: true, surface: true, image_url: true,
    },
  } as const;

  private readonly DETAIL_INCLUDE = {
    ...MATCH_INCLUDE,
    venue_ref:  this.VENUE_SELECT,
    // sportmonks_id is now BigInt (raw SportMonks IDs exceed INT4 range) and the
    // client never needs it — select it out so it never reaches JSON.stringify,
    // which throws "Do not know how to serialize a BigInt".
    events: {
      orderBy: { sort_order: 'asc' as const },
      select: {
        id: true, type: true, minute: true, extra_minute: true, team_id: true,
        player_name: true, related_player_name: true, detail: true, sort_order: true,
      },
    },
    lineups: {
      orderBy: { jersey_number: 'asc' as const },
      select: {
        id: true, team_id: true, player_name: true, player_photo: true,
        jersey_number: true, position: true, formation_field: true, is_starting: true,
      },
    },
    statistics: {
      select: {
        team_id:         true,
        possession:      true,
        shots:           true,
        shots_on_target: true,
        xg:              true,
        corners:         true,
        fouls:           true,
        yellow_cards:    true,
        red_cards:       true,
      },
    },
  };

  async findOne(id: string) {
    // Resolve by our cuid, or fall back to the SportMonks fixture id (used by
    // bracket ties, which carry the SportMonks id rather than our internal id).
    let match = await this.prisma.match.findUnique({
      where:   { id },
      include: this.DETAIL_INCLUDE,
    });
    if (!match && /^\d+$/.test(id)) {
      match = await this.prisma.match.findUnique({
        where:   { api_football_id: Number(id) },
        include: this.DETAIL_INCLUDE,
      });
    }

    // Not in our DB but it's a SportMonks fixture id → a placeholder knockout
    // tie. Return a lightweight preview (cached) instead of 404.
    if (!match && /^\d+$/.test(id)) {
      const preview = await this.cache.getOrSet(
        `preview:${id}`,
        6 * 60 * 60 * 1000, // 6 hours
        () => this.buildPreview(Number(id)),
      );
      if (preview) return { data: preview };
    }

    if (!match) throw new NotFoundException('Match not found');

    return { data: match };
  }
}
