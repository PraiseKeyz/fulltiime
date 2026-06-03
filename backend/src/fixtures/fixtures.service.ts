import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
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

const LEAGUE_WEIGHT: Record<number, number> = {
  2: 6, 39: 5, 140: 4, 135: 3, 78: 2, 3: 1,
};

@Injectable()
export class FixturesService {
  constructor(private readonly prisma: PrismaService) {}

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

    // 2. Fallback: next scheduled match from our leagues
    const upcoming = await this.prisma.match.findFirst({
      where: {
        status:     MatchStatus.SCHEDULED,
        kickoff_at: { gte: new Date() },
        season:     { league: { api_football_id: { in: [2, 39, 140, 135, 78, 3] } } },
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
        season: { league: { api_football_id: { in: [2, 39, 140, 135, 78, 3] } } },
      },
      orderBy: { kickoff_at: 'desc' },
      include: FEATURED_INCLUDE,
    });

    return { data: { match: finished ?? null, type: 'finished' as const } };
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        ...MATCH_INCLUDE,
        events:     { orderBy: { minute: 'asc' } },
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
      },
    });
    if (!match) throw new NotFoundException('Match not found');
    return { data: match };
  }
}
