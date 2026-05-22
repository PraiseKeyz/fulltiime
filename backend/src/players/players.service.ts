import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { teamId?: string; search?: string; position?: string }) {
    const players = await this.prisma.player.findMany({
      where: {
        is_active: true,
        ...(query.teamId && { team_id: query.teamId }),
        ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
        ...(query.position && { position: query.position as any }),
      },
      include: {
        team: { select: { id: true, name: true, short_name: true, logo_url: true } },
        country: true,
      },
      orderBy: { name: 'asc' },
    });
    return { data: players };
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        team: { select: { id: true, name: true, short_name: true, logo_url: true } },
        country: true,
      },
    });
    if (!player) throw new NotFoundException('Player not found');
    return { data: player };
  }
}
