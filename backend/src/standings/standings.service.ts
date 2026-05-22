import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';

@Injectable()
export class StandingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLeague(leagueId: string, seasonYear?: number) {
    let season = seasonYear
      ? await this.prisma.season.findFirst({
          where: { league_id: leagueId, year: seasonYear },
        })
      : await this.prisma.season.findFirst({
          where: { league_id: leagueId, is_current: true },
        });

    if (!season) throw new NotFoundException('Season not found');

    const standings = await this.prisma.standing.findMany({
      where: { season_id: season.id },
      include: {
        team: { select: { id: true, name: true, short_name: true, logo_url: true } },
      },
      orderBy: { position: 'asc' },
    });

    return { data: { season, standings } };
  }

  async findByTeam(teamId: string) {
    const standings = await this.prisma.standing.findMany({
      where: { team_id: teamId },
      include: {
        season: { include: { league: { select: { id: true, name: true, logo_url: true } } } },
      },
      orderBy: { season: { year: 'desc' } },
    });
    return { data: standings };
  }
}
