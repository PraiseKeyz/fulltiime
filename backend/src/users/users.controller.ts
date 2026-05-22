import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { SafeUser } from '@/common/constants/user-select.constant.js';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: SafeUser) {
    return this.usersService.findById(user.id);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: SafeUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Post('favorites/teams/:teamId')
  addFavoriteTeam(@CurrentUser() user: SafeUser, @Param('teamId') teamId: string) {
    return this.usersService.addFavoriteTeam(user.id, teamId);
  }

  @Delete('favorites/teams/:teamId')
  removeFavoriteTeam(@CurrentUser() user: SafeUser, @Param('teamId') teamId: string) {
    return this.usersService.removeFavoriteTeam(user.id, teamId);
  }

  @Post('favorites/leagues/:leagueId')
  addFavoriteLeague(@CurrentUser() user: SafeUser, @Param('leagueId') leagueId: string) {
    return this.usersService.addFavoriteLeague(user.id, leagueId);
  }

  @Delete('favorites/leagues/:leagueId')
  removeFavoriteLeague(@CurrentUser() user: SafeUser, @Param('leagueId') leagueId: string) {
    return this.usersService.removeFavoriteLeague(user.id, leagueId);
  }
}
