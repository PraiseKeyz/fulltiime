import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';

@Injectable()
export class LeaguesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const leagues = await this.prisma.league.findMany({
      where: { is_active: true },
      include: { country: true, _count: { select: { seasons: true } } },
      orderBy: { name: 'asc' },
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
