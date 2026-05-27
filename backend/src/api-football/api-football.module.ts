import { Module } from '@nestjs/common';
import { ApiFootballService } from './api-football.service.js';

@Module({
  providers: [ApiFootballService],
  exports:   [ApiFootballService],
})
export class ApiFootballModule {}
