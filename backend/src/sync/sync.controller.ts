import { Controller, Post, HttpCode } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { Public } from '@/common/decorators/public.decorator.js';

@Public()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

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
}
