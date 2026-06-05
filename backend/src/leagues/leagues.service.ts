import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { leaguePriority } from '@/common/constants/league-priority.constant.js';

@Injectable()
export class LeaguesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const leagues = await this.prisma.league.findMany({
      where: { is_active: true },
      include: { country: true, _count: { select: { seasons: true } } },
    });

    // Order by "hotness" priority, then alphabetically as a tie-breaker
    leagues.sort((a, b) => {
      const diff = leaguePriority(b.api_football_id) - leaguePriority(a.api_football_id);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });

    return { data: leagues };
  }

  async findOne(id: string) {
    const league = await this.prisma.league.findUnique({
      where: { id },
      include: {
        country: true,
        seasons: {
          orderBy: { year: 'desc' },
          take: 5,
        },
      },
    });
    if (!league) throw new NotFoundException('League not found');
    return { data: league };
  }

  async findCurrentSeason(leagueId: string) {
    const season = await this.prisma.season.findFirst({
      where: { league_id: leagueId, is_current: true },
      include: { league: true },
    });
    if (!season) throw new NotFoundException('No current season found for this league');
    return { data: season };
  }
}
