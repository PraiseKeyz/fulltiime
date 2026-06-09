import { Module } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { SyncController } from './sync.controller.js';
import { SportMonksModule } from '../sportmonks/sportmonks.module.js';
import { NewsModule } from '../news/news.module.js';

@Module({
  imports:     [SportMonksModule, NewsModule],
  providers:   [SyncService],
  controllers: [SyncController],
  exports:     [SyncService],
})
export class SyncModule {}
