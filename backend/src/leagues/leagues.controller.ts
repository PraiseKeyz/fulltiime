import { Controller, Get, Param } from '@nestjs/common';
import { LeaguesService } from './leagues.service.js';
import { Public } from '@/common/decorators/public.decorator.js';

@Public()
@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Get()
  findAll() {
    return this.leaguesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaguesService.findOne(id);
  }

  @Get(':id/current-season')
  findCurrentSeason(@Param('id') id: string) {
    return this.leaguesService.findCurrentSeason(id);
  }
}
