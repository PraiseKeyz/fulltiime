import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service.js';
import { LiveChatService } from './live-chat.service.js';

// Socket extended with optional authenticated user
interface AuthSocket extends Socket {
  userId?: string;
  username?: string;
  avatarUrl?: string | null;
}

@WebSocketGateway({
  namespace: '/live-chat',
  cors: { origin: true, credentials: true },
})
export class LiveChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  // In-memory rate limit: userId → last send timestamp
  private readonly lastSent = new Map<string, number>();

  constructor(
    private readonly chat:   LiveChatService,
    private readonly jwt:    JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthSocket) {
    const raw = client.handshake.headers.cookie ?? '';
    const token = raw
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('access_token='))
      ?.slice('access_token='.length);

    if (!token) return;

    try {
      const payload = this.jwt.verify<{ sub: string }>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where:  { id: payload.sub },
        select: { id: true, username: true, avatar_url: true },
      });
      if (user) {
        client.userId    = user.id;
        client.username  = user.username;
        client.avatarUrl = user.avatar_url;
      }
    } catch {
      // Unauthenticated — read-only, sending will be rejected
    }
  }

  handleDisconnect(_client: AuthSocket) {}

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() matchId: string,
  ) {
    await client.join(`match:${matchId}`);
    const history = await this.chat.getHistory(matchId);
    client.emit('history', history);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() matchId: string,
  ) {
    client.leave(`match:${matchId}`);
  }

  @SubscribeMessage('send')
  async handleSend(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { matchId: string; content: string },
  ) {
    if (!client.userId) {
      client.emit('error', 'Sign in to join the conversation.');
      return;
    }

    const content = (data.content ?? '').trim().slice(0, 500);
    if (!content) return;

    // 2-second cooldown per user
    const now  = Date.now();
    const last = this.lastSent.get(client.userId) ?? 0;
    if (now - last < 2000) {
      client.emit('error', 'Slow down a little!');
      return;
    }
    this.lastSent.set(client.userId, now);

    const saved = await this.chat.save(data.matchId, client.userId, content);

    this.server.to(`match:${data.matchId}`).emit('message', saved);
  }
}
