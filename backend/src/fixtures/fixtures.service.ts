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

  // ── Head-to-head ──────────────────────────────────────────────────────────────

  // Past meetings change rarely (only when these two teams play again) → cache
  // for a day, keyed symmetrically so either fixture order hits the same entry.
  async getHeadToHead(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where:   { id: matchId },
      select:  {
        home_team: { select: { api_football_id: true } },
        away_team: { select: { api_football_id: true } },
      },
    });
    if (!match) throw new NotFoundException('Match not found');

    const homeApiId = match.home_team.api_football_id;
    const awayApiId = match.away_team.api_football_id;
    if (!homeApiId || !awayApiId) return { data: null };

    const [a, b] = [homeApiId, awayApiId].sort((x, y) => x - y);
    const data = await this.cache.getOrSet(
      `h2h:${a}:${b}`,
      24 * 60 * 60 * 1000, // 24 hours
      () => this.buildHeadToHead(homeApiId, awayApiId),
    );
    return { data };
  }

  private async buildHeadToHead(homeApiId: number, awayApiId: number) {
    const raw = await this.sportmonks.getHeadToHead(homeApiId, awayApiId);

    const meetings = raw
      .map((f: any) => this.mapH2HFixture(f))
      .filter((m: any): m is NonNullable<typeof m> => m !== null)
      .sort((x: any, y: any) => +new Date(y.date ?? 0) - +new Date(x.date ?? 0));

    // Tally relative to THIS fixture's home/away (not each meeting's historical
    // venue) — so "Real Madrid 3 — Draws 2 — Barcelona 1" reads naturally.
    let homeWins = 0, draws = 0, awayWins = 0;
    for (const m of meetings) {
      if (m.homeScore == null || m.awayScore == null) continue;
      const homeGoals = m.homeIsApiId === homeApiId ? m.homeScore : m.awayScore;
      const awayGoals = m.homeIsApiId === homeApiId ? m.awayScore : m.homeScore;
      if (homeGoals > awayGoals) homeWins++;
      else if (homeGoals < awayGoals) awayWins++;
      else draws++;
    }

    return {
      meetings: meetings.slice(0, 10).map(({ homeIsApiId, ...m }: any) => m),
      summary: { played: meetings.length, homeWins, draws, awayWins },
    };
  }

  // Map a SportMonks h2h fixture into a compact shape; null when participants
  // are missing (shouldn't happen, but the API is third-party data).
  private mapH2HFixture(f: any) {
    const parts = f.participants ?? [];
    const home  = parts.find((p: any) => p.meta?.location === 'home');
    const away  = parts.find((p: any) => p.meta?.location === 'away');
    if (!home || !away) return null;

    const scores  = (f.scores ?? []).filter((s: any) => s.description === 'CURRENT');
    const goals   = (loc: string) =>
      scores.find((s: any) => s.score?.participant === loc)?.score?.goals ?? null;

    return {
      id:        f.id,
      date:      f.starting_at ?? null,
      league:    f.league ? { name: f.league.name, logo: f.league.image_path } : null,
      homeTeam:  { name: home.name, logo: home.image_path ?? null },
      awayTeam:  { name: away.name, logo: away.image_path ?? null },
      homeScore: goals('home'),
      awayScore: goals('away'),
      homeIsApiId: home.id, // internal — stripped before returning to the client
    };
  }

  async findAll(query: { status?: MatchStatus; leagueId?: string; teamId?: string; date?: string }) {
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.leagueId) where.season = { league_id: query.leagueId };
    if (query.teamId) {
      where.OR = [{ home_team_id: query.teamId }, { away_team_id: query.teamId }];
    }
    if (query.date) {
      const day = new Date(query.date);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      where.kickoff_at = { gte: day, lt: nextDay };
    }

    const matches = await this.prisma.match.findMany({
      where,
      include: MATCH_INCLUDE,
      orderBy: { kickoff_at: 'asc' },
    });

    return { data: matches };
  }

  async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const matches = await this.prisma.match.findMany({
      where: { kickoff_at: { gte: today, lt: tomorrow } },
      include: MATCH_INCLUDE,
      orderBy: { kickoff_at: 'asc' },
    });

    return { data: matches };
  }

  async findLive() {
    const matches = await this.prisma.match.findMany({
      where: { status: { in: [MatchStatus.LIVE, MatchStatus.HALFTIME] } },
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
      where: { status: { in: [MatchStatus.LIVE, MatchStatus.HALFTIME] } },
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
