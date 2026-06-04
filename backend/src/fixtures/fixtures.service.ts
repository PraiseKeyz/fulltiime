import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { SyncService } from '@/sync/sync.service.js';
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
    private readonly prisma: PrismaService,
    private readonly sync:   SyncService,
  ) {}

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

  private readonly DETAIL_INCLUDE = {
    ...MATCH_INCLUDE,
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
    let match = await this.prisma.match.findUnique({
      where:   { id },
      include: this.DETAIL_INCLUDE,
    });
    if (!match) throw new NotFoundException('Match not found');

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
        where:   { id },
        include: this.DETAIL_INCLUDE,
      });
    }

    return { data: match };
  }
}
