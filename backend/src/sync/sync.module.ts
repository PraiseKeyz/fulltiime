import { Module } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { ApiFootballModule } from '../api-football/api-football.module.js';

@Module({
  imports:   [ApiFootballModule],
  providers: [SyncService],
  exports:   [SyncService],
})
export class SyncModule {}
