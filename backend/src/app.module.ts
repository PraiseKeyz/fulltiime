import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { EmailModule } from './email/email.module.js';
import { UsersModule } from './users/users.module.js';
import { FixturesModule } from './fixtures/fixtures.module.js';
import { LeaguesModule } from './leagues/leagues.module.js';
import { StandingsModule } from './standings/standings.module.js';
import { NewsModule } from './news/news.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { PlayersModule } from './players/players.module.js';
import { SportMonksModule } from './sportmonks/sportmonks.module.js';
import { SyncModule } from './sync/sync.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([{
      name: 'global',
      ttl: 60000,
      limit: 120,
    }]),

    PrismaModule,
    AuthModule,
    EmailModule,
    UsersModule,
    FixturesModule,
    LeaguesModule,
    StandingsModule,
    NewsModule,
    TeamsModule,
    PlayersModule,
    SportMonksModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
