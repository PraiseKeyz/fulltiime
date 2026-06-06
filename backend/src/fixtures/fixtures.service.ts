import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { SyncService } from '@/sync/sync.service.js';
import { SportMonksService } from '@/sportmonks/sportmonks.service.js';
import { CacheService } from '@/cache/cache.service.js';
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
    private readonly sync:       SyncService,
    private readonly sportmonks: SportMonksService,
    private readonly cache:      CacheService,
  ) {}

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
    events:     { orderBy: { sort_order: 'asc' as const } },
    lineups:    { orderBy: { jersey_number: 'asc' as const } },
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

    const resolvedId = match.id;

    // Lazy-load full detail (events/lineups/stats) on first view of a
    // live, finished, or about-to-start match when we don't have it yet.
    const minsToKickoff = (new Date(match.kickoff_at).getTime() - Date.now()) / 60_000;
    const shouldHydrate =
      match.api_football_id != null &&
      match.events.length === 0 &&
      (
        match.status === MatchStatus.LIVE ||
        match.status === MatchStatus.HALFTIME ||
        match.status === MatchStatus.FINISHED ||
        (match.status === MatchStatus.SCHEDULED && minsToKickoff <= 75 && minsToKickoff > -5)
      );

    if (shouldHydrate) {
      await this.sync.syncFixtureDetail(match.api_football_id!);
      match = await this.prisma.match.findUnique({
        where:   { id: resolvedId },
        include: this.DETAIL_INCLUDE,
      });
    }

    return { data: match };
  }
}
