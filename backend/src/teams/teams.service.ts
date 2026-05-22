import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { countryId?: string; search?: string }) {
    const teams = await this.prisma.team.findMany({
      where: {
        is_active: true,
        ...(query.countryId && { country_id: query.countryId }),
        ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
      },
      include: { country: true },
      orderBy: { name: 'asc' },
    });
    return { data: teams };
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        country: true,
        players: {
          where: { is_active: true },
          orderBy: [{ position: 'asc' }, { name: 'asc' }],
        },
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    return { data: team };
  }

  async findFixtures(teamId: string, limit = 10) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const fixtures = await this.prisma.match.findMany({
      where: { OR: [{ home_team_id: teamId }, { away_team_id: teamId }] },
      include: {
        home_team: { select: { id: true, name: true, short_name: true, logo_url: true } },
        away_team: { select: { id: true, name: true, short_name: true, logo_url: true } },
        season: { include: { league: { select: { id: true, name: true, logo_url: true } } } },
      },
      orderBy: { kickoff_at: 'desc' },
      take: limit,
    });

    return { data: fixtures };
  }
}
