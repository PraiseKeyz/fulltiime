import { Module } from '@nestjs/common';
import { FixturesService } from './fixtures.service.js';
import { FixturesController } from './fixtures.controller.js';
import { SyncModule } from '@/sync/sync.module.js';

@Module({
  imports:     [SyncModule],
  controllers: [FixturesController],
  providers:   [FixturesService],
})
export class FixturesModule {}
