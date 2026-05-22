import { Controller, Get, Param, Query } from '@nestjs/common';
import { StandingsService } from './standings.service.js';
import { Public } from '@/common/decorators/public.decorator.js';

@Public()
@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get('league/:leagueId')
  findByLeague(
    @Param('leagueId') leagueId: string,
    @Query('season') season?: string,
  ) {
    return this.standingsService.findByLeague(leagueId, season ? Number(season) : undefined);
  }

  @Get('team/:teamId')
  findByTeam(@Param('teamId') teamId: string) {
    return this.standingsService.findByTeam(teamId);
  }
}
