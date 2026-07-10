import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service.js';

const ROOM_RE = /^[a-z0-9-]{1,140}$/i;
const MAX_BODY = 500;
const HISTORY_SIZE = 50;
const MIN_MSG_INTERVAL_MS = 1_000;

interface ChatUser {
  id: string;
  username: string;
}

interface WireMessage {
  id: string;
  body: string;
  reply_to: string | null;
  created_at: string;
  user: ChatUser;
}

function roomKey(room: string) {
  return `room:${room}`;
}

/**
 * Realtime article threads. Anyone can connect and read; posting requires a
 * valid access-token cookie (same JWT the REST API uses).
 */
@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Namespace;

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    // Guests may read; a valid access_token cookie upgrades them to a poster.
    const token = this.tokenFromCookie(client.handshake.headers.cookie);
    if (!token) return;

    try {
      const payload = this.jwt.verify<{ sub: string }>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true },
      });
      if (user) client.data.user = user satisfies ChatUser;
    } catch {
      // Expired/invalid token — stay a guest. Reconnects re-authenticate.
    }
  }

  handleDisconnect(client: Socket) {
    this.broadcastPresence(client.data.room);
  }

  @SubscribeMessage('join')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room?: string },
  ) {
    const room = payload?.room ?? '';
    if (!ROOM_RE.test(room)) return { error: 'Invalid room' };

    // One article thread per socket — leaving the old room keeps presence honest.
    const previous = client.data.room as string | undefined;
    if (previous && previous !== room) {
      await client.leave(roomKey(previous));
      this.broadcastPresence(previous);
    }

    await client.join(roomKey(room));
    client.data.room = room;

    const history = await this.prisma.chatMessage.findMany({
      where: { room },
      orderBy: { created_at: 'desc' },
      take: HISTORY_SIZE,
      include: { user: { select: { id: true, username: true } } },
    });

    // Presence including the just-joined socket.
    const fans = this.roomSize(room);
    this.broadcastPresence(room);

    return {
      history: history.reverse().map((m) => this.toWire(m)),
      fans,
      canPost: !!client.data.user,
    };
  }

  @SubscribeMessage('leave')
  async onLeave(@ConnectedSocket() client: Socket) {
    const room = client.data.room as string | undefined;
    if (!room) return;
    await client.leave(roomKey(room));
    client.data.room = undefined;
    this.broadcastPresence(room);
  }

  @SubscribeMessage('message')
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { body?: string; reply_to?: string },
  ) {
    const user = client.data.user as ChatUser | undefined;
    const room = client.data.room as string | undefined;

    if (!user) return { error: 'Sign in to join the conversation' };
    if (!room) return { error: 'Join a thread first' };

    const body = (payload?.body ?? '').trim();
    if (!body) return { error: 'Empty message' };
    if (body.length > MAX_BODY) return { error: `Keep it under ${MAX_BODY} characters` };

    const now = Date.now();
    if (now - (client.data.lastMessageAt ?? 0) < MIN_MSG_INTERVAL_MS) {
      return { error: 'Easy — one message per second' };
    }
    client.data.lastMessageAt = now;

    const reply_to = payload?.reply_to?.trim().slice(0, 30) || null;

    const message = await this.prisma.chatMessage.create({
      data: { room, body, reply_to, user_id: user.id },
      include: { user: { select: { id: true, username: true } } },
    });

    const wire = this.toWire(message);
    this.server.to(roomKey(room)).emit('message', wire);
    return { ok: true, message: wire };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private toWire(m: {
    id: string;
    body: string;
    reply_to: string | null;
    created_at: Date;
    user: ChatUser;
  }): WireMessage {
    return {
      id: m.id,
      body: m.body,
      reply_to: m.reply_to,
      created_at: m.created_at.toISOString(),
      user: m.user,
    };
  }

  private roomSize(room: string): number {
    return this.server.adapter.rooms.get(roomKey(room))?.size ?? 0;
  }

  private broadcastPresence(room: string | undefined) {
    if (!room) return;
    this.server.to(roomKey(room)).emit('presence', { fans: this.roomSize(room) });
  }

  private tokenFromCookie(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;
    for (const part of cookieHeader.split(';')) {
      const [name, ...rest] = part.trim().split('=');
      if (name === 'access_token') return decodeURIComponent(rest.join('='));
    }
    return null;
  }
}
