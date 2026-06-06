import { Module } from '@nestjs/common';
import { FixturesService } from './fixtures.service.js';
import { FixturesController } from './fixtures.controller.js';
import { SyncModule } from '@/sync/sync.module.js';
import { SportMonksModule } from '@/sportmonks/sportmonks.module.js';
import { CacheModule } from '@/cache/cache.module.js';

@Module({
  imports:     [SyncModule, SportMonksModule, CacheModule],
  controllers: [FixturesController],
  providers:   [FixturesService],
})
export class FixturesModule {}
