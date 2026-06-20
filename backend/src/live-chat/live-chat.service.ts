import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import { ChatAttachmentType } from '../../generated/prisma/index.js';

const MSG_SELECT = {
  id:                  true,
  content:             true,
  attachment_url:      true,
  attachment_type:     true,
  attachment_duration: true,
  created_at:          true,
  user: {
    select: {
      id:         true,
      username:   true,
      avatar_url: true,
    },
  },
  reply_to: {
    select: {
      id:      true,
      content: true,
      user:    { select: { username: true } },
    },
  },
} as const;

export interface SaveMessageInput {
  matchId:             string;
  userId:              string;
  content:             string;
  replyToId?:          string | null;
  attachmentUrl?:      string | null;
  attachmentType?:     ChatAttachmentType | null;
  attachmentDuration?: number | null;
}

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

  async save(input: SaveMessageInput) {
    return this.prisma.liveChatMessage.create({
      data: {
        match_id:            input.matchId,
        user_id:             input.userId,
        content:             input.content,
        reply_to_id:         input.replyToId ?? null,
        attachment_url:      input.attachmentUrl ?? null,
        attachment_type:     input.attachmentType ?? null,
        attachment_duration: input.attachmentDuration ?? null,
      },
      select: MSG_SELECT,
    });
  }
}
