import { Controller, Post, HttpCode } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { NewsSyncService } from '../news/news-sync.service.js';
import { Public } from '@/common/decorators/public.decorator.js';

@Public()
@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncService:     SyncService,
    private readonly newsSyncService: NewsSyncService,
  ) {}

  @Post('run')
  @HttpCode(200)
  async runFullSync() {
    await this.syncService.runFullSync();
    return { message: 'Full sync completed' };
  }

  @Post('leagues')
  @HttpCode(200)
  async syncLeagues() {
    await this.syncService.syncLeagues();
    return { message: 'Leagues sync completed' };
  }

  @Post('teams')
  @HttpCode(200)
  async syncTeams() {
    await this.syncService.syncTeams();
    return { message: 'Teams sync completed' };
  }

  @Post('venues')
  @HttpCode(200)
  async syncVenues() {
    await this.syncService.syncVenues();
    return { message: 'Venues sync completed' };
  }

  @Post('fixtures')
  @HttpCode(200)
  async syncFixtures() {
    await this.syncService.syncFixtures();
    return { message: 'Fixtures sync completed' };
  }

  @Post('standings')
  @HttpCode(200)
  async syncStandings() {
    await this.syncService.syncStandings();
    return { message: 'Standings sync completed' };
  }

  @Post('lineups')
  @HttpCode(200)
  async syncLineups() {
    await this.syncService.syncLineups();
    return { message: 'Lineups sync completed' };
  }

  @Post('team-form')
  @HttpCode(200)
  async syncTeamForm() {
    await this.syncService.syncTeamForm();
    return { message: 'Team form sync completed' };
  }

  @Post('h2h')
  @HttpCode(200)
  async syncH2H() {
    await this.syncService.syncH2H();
    return { message: 'H2H sync completed' };
  }

  @Post('news')
  @HttpCode(200)
  async syncNews() {
    await this.newsSyncService.syncNews();
    return { message: 'News sync completed' };
  }
}
