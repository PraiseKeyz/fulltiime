import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';

const MSG_SELECT = {
  id:         true,
  content:    true,
  created_at: true,
  user: {
    select: {
      id:         true,
      username:   true,
      avatar_url: true,
    },
  },
} as const;

@Injectable()
export class LiveChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(matchId: string, limit = 50) {
    const rows = await this.prisma.liveChatMessage.findMany({
      where:   { match_id: matchId },
      select:  MSG_SELECT,
      orderBy: { created_at: 'desc' },
      take:    limit,
    });
    return rows.reverse();
  }

  async save(matchId: string, userId: string, content: string) {
    return this.prisma.liveChatMessage.create({
      data:   { match_id: matchId, user_id: userId, content },
      select: MSG_SELECT,
    });
  }
}
