import { Controller, Get, Param, Query } from '@nestjs/common';
import { FixturesService } from './fixtures.service.js';
import { Public } from '@/common/decorators/public.decorator.js';
import { MatchStatus } from '../../generated/prisma/index.js';

@Public()
@Controller('fixtures')
export class FixturesController {
  constructor(private readonly fixturesService: FixturesService) {}

  @Get()
  findAll(
    @Query('status') status?: MatchStatus,
    @Query('leagueId') leagueId?: string,
    @Query('teamId') teamId?: string,
    @Query('date') date?: string,
  ) {
    return this.fixturesService.findAll({ status, leagueId, teamId, date });
  }

  @Get('today')
  findToday() {
    return this.fixturesService.findToday();
  }

  @Get('live')
  findLive() {
    return this.fixturesService.findLive();
  }

  @Get('upcoming')
  findUpcoming(
    @Query('leagueId') leagueId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.fixturesService.findUpcoming(leagueId, limit ? Number(limit) : 10);
  }

  @Get('featured')
  findFeatured() {
    return this.fixturesService.findFeatured();
  }

  @Get('bracket/:leagueId')
  getBracket(@Param('leagueId') leagueId: string) {
    return this.fixturesService.getBracket(leagueId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fixturesService.findOne(id);
  }
}
