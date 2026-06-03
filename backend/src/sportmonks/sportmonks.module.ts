import { Module } from '@nestjs/common';
import { SportMonksService } from './sportmonks.service.js';

@Module({
  providers: [SportMonksService],
  exports:   [SportMonksService],
})
export class SportMonksModule {}
