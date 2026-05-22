import { Module } from '@nestjs/common';
import { FixturesService } from './fixtures.service.js';
import { FixturesController } from './fixtures.controller.js';

@Module({
  controllers: [FixturesController],
  providers: [FixturesService],
})
export class FixturesModule {}
