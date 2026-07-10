import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module.js';
import { PrismaModule } from '@/prisma/prisma.module.js';
import { ChatGateway } from './chat.gateway.js';

@Module({
  // AuthModule exports the configured JwtModule (same secret as the REST API).
  imports: [AuthModule, PrismaModule],
  providers: [ChatGateway],
})
export class ChatModule {}
