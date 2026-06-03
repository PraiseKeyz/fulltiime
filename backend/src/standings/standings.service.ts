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

  async snapshot() {
    const leagues = await this.prisma.league.findMany({
      where:   { is_active: true },
      include: {
        seasons: {
          where:   { is_current: true },
          take:    1,
          include: {
            standings: {
              include:  { team: { select: { id: true, name: true, short_name: true, logo_url: true } } },
              orderBy:  { position: 'asc' },
              take:     5,
            },
          },
        },
      },
    });

    const result = leagues
      .filter(l => l.seasons[0]?.standings.length > 0)
      .map(l => ({
        league:    { id: l.id, name: l.name, logo_url: l.logo_url, short_name: l.short_name },
        standings: l.seasons[0].standings,
      }));

    return { data: result };
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
