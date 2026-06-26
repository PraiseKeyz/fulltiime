import { Body, Controller, Get, Param, Post, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FixturesService } from './fixtures.service.js';
import { ChatDto } from './dto/chat.dto.js';
import { Public, IS_PUBLIC_KEY } from '@/common/decorators/public.decorator.js';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { SafeUser } from '@/common/constants/user-select.constant.js';
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
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.fixturesService.findAll({ status, leagueId, teamId, date, from, to });
  }

  @Get('today')
  findToday(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.fixturesService.findToday(from, to);
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

  @Get('sitemap')
  findForSitemap() {
    return this.fixturesService.findForSitemap();
  }

  @Get('bracket/:leagueId')
  getBracket(@Param('leagueId') leagueId: string) {
    return this.fixturesService.getBracket(leagueId);
  }

  @Get(':id/form')
  getMatchForm(@Param('id') id: string) {
    return this.fixturesService.getMatchForm(id);
  }

  @Get(':id/h2h')
  getHeadToHead(@Param('id') id: string) {
    return this.fixturesService.getHeadToHead(id);
  }

  @Get(':id/narrative')
  getNarrative(@Param('id') id: string) {
    return this.fixturesService.getNarrative(id);
  }

  @Get(':id/commentary')
  getCommentary(@Param('id') id: string) {
    return this.fixturesService.getCommentary(id);
  }

  // Chat is the one auth-gated route on this otherwise-@Public() controller —
  // the class-level @Public() must be explicitly overridden here, or
  // JwtAuthGuard would see it and wave everyone through. Signed-in only is the
  // spec's cost/abuse control (§9); the tighter throttle bounds it further.
  @UseGuards(JwtAuthGuard)
  @SetMetadata(IS_PUBLIC_KEY, false)
  @Throttle({ global: { limit: 12, ttl: 60_000 } })
  @Post(':id/chat')
  chat(@Param('id') id: string, @CurrentUser() _user: SafeUser, @Body() dto: ChatDto) {
    return this.fixturesService.chat(id, dto.messages);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fixturesService.findOne(id);
  }
}
