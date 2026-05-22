import { Controller, Get, Param, Query } from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { Public } from '@/common/decorators/public.decorator.js';

@Public()
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll(
    @Query('countryId') countryId?: string,
    @Query('search') search?: string,
  ) {
    return this.teamsService.findAll({ countryId, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Get(':id/fixtures')
  findFixtures(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.teamsService.findFixtures(id, limit ? Number(limit) : 10);
  }
}
