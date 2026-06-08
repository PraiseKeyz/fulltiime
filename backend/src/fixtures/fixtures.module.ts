import { Module } from '@nestjs/common';
import { FixturesService } from './fixtures.service.js';
import { FixturesController } from './fixtures.controller.js';
import { SportMonksModule } from '@/sportmonks/sportmonks.module.js';
import { CacheModule } from '@/cache/cache.module.js';
import { LlmModule } from '@/llm/llm.module.js';

@Module({
  imports:     [SportMonksModule, CacheModule, LlmModule],
  controllers: [FixturesController],
  providers:   [FixturesService],
})
export class FixturesModule {}
