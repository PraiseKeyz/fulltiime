import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlayersService } from './players.service.js';
import { Public } from '@/common/decorators/public.decorator.js';

@Public()
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(
    @Query('teamId') teamId?: string,
    @Query('search') search?: string,
    @Query('position') position?: string,
  ) {
    return this.playersService.findAll({ teamId, search, position });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }
}
