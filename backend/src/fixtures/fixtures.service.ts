import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { MatchStatus } from '../../generated/prisma/index.js';

const MATCH_INCLUDE = {
  home_team: { select: { id: true, name: true, short_name: true, logo_url: true } },
  away_team: { select: { id: true, name: true, short_name: true, logo_url: true } },
  season: { include: { league: { select: { id: true, name: true, logo_url: true } } } },
} as const;

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

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        ...MATCH_INCLUDE,
        events: { orderBy: { minute: 'asc' } },
      },
    });
    if (!match) throw new NotFoundException('Match not found');
    return { data: match };
  }
}
