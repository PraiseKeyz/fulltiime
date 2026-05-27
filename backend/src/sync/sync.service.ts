import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiFootballService } from '../api-football/api-football.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MatchStatus } from '../../generated/prisma/index.js';

// Leagues we sync
const LEAGUE_IDS = [
  { id: 39,  name: 'Premier League',    shortName: 'PL'  },
  { id: 2,   name: 'Champions League',  shortName: 'UCL' },
  { id: 140, name: 'La Liga',           shortName: 'LL'  },
  { id: 135, name: 'Serie A',           shortName: 'SA'  },
  { id: 78,  name: 'Bundesliga',        shortName: 'BUN' },
  { id: 3,   name: 'Europa League',     shortName: 'EL'  },
]

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly api: ApiFootballService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private toMatchStatus(short: string): MatchStatus {
    const map: Record<string, MatchStatus> = {
      '1H': MatchStatus.LIVE,
      '2H': MatchStatus.LIVE,
      'ET': MatchStatus.LIVE,
      'BT': MatchStatus.LIVE,
      'P':  MatchStatus.LIVE,
      'HT': MatchStatus.HALFTIME,
      'FT': MatchStatus.FINISHED,
      'AET':MatchStatus.FINISHED,
      'PEN':MatchStatus.FINISHED,
      'PST':MatchStatus.POSTPONED,
      'CANC':MatchStatus.CANCELLED,
      'NS': MatchStatus.SCHEDULED,
      'TBD':MatchStatus.SCHEDULED,
    };
    return map[short] ?? MatchStatus.SCHEDULED;
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  // ── Upsert country ───────────────────────────────────────────────────────────

  private async upsertCountry(name: string, code?: string, flagUrl?: string) {
    if (!name) return null;
    const safeCode = code || name.slice(0, 3).toUpperCase();
    return this.prisma.country.upsert({
      where: { code: safeCode },
      update: { name, flag_url: flagUrl },
      create: { name, code: safeCode, flag_url: flagUrl },
    });
  }

  // ── Sync leagues ─────────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async syncLeagues() {
    this.logger.log('Syncing leagues...');

    for (const league of LEAGUE_IDS) {
      try {
        const data = await this.api.getLeague(league.id);
        if (!data) continue;

        const { league: l, country } = data;
        const countryRecord = await this.upsertCountry(country?.name, country?.code, country?.flag);

        await this.prisma.league.upsert({
          where:  { api_football_id: l.id },
          update: { name: l.name, logo_url: l.logo, country_id: countryRecord?.id },
          create: {
            api_football_id: l.id,
            name:            l.name,
            short_name:      league.shortName,
            logo_url:        l.logo,
            country_id:      countryRecord?.id,
            is_active:       true,
          },
        });

        // Upsert current season
        const seasonData = data.seasons?.find((s: any) => s.current);
        if (seasonData) {
          const dbLeague = await this.prisma.league.findUnique({ where: { api_football_id: l.id } });
          if (dbLeague) {
            await this.prisma.season.upsert({
              where:  { league_id_year: { league_id: dbLeague.id, year: seasonData.year } },
              update: { is_current: true },
              create: {
                league_id:  dbLeague.id,
                year:       seasonData.year,
                start_date: new Date(seasonData.start),
                end_date:   new Date(seasonData.end),
                is_current: true,
              },
            });
          }
        }
      } catch (err: any) {
        this.logger.error(`Failed syncing league ${league.id}: ${err.message}`);
      }
    }

    this.logger.log('Leagues sync complete');
  }

  // ── Sync teams ───────────────────────────────────────────────────────────────

  @Cron('0 3 * * 1') // every Monday at 3am
  async syncTeams() {
    this.logger.log('Syncing teams...');

    for (const league of LEAGUE_IDS) {
      try {
        const teams = await this.api.getTeams(league.id);
        if (!teams?.length) continue;

        for (const item of teams) {
          const { team, venue } = item;
          const countryRecord = await this.upsertCountry(team.country);

          await this.prisma.team.upsert({
            where:  { api_football_id: team.id },
            update: {
              name:       team.name,
              code:       team.code,
              logo_url:   team.logo,
              stadium:    venue?.name,
              venue_city: venue?.city,
            },
            create: {
              api_football_id: team.id,
              name:            team.name,
              short_name:      team.code,
              code:            team.code,
              logo_url:        team.logo,
              founded:         team.founded,
              stadium:         venue?.name,
              venue_city:      venue?.city,
              country_id:      countryRecord?.id,
              is_active:       true,
            },
          });
        }
      } catch (err: any) {
        this.logger.error(`Failed syncing teams for league ${league.id}: ${err.message}`);
      }
    }

    this.logger.log('Teams sync complete');
  }

  // ── Sync fixtures (next 7 days) ───────────────────────────────────────────────

  @Cron('0 */6 * * *') // every 6 hours
  async syncFixtures() {
    this.logger.log('Syncing fixtures...');

    const today = new Date();
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    for (const league of LEAGUE_IDS) {
      try {
        const fixtures = await this.api.getFixturesByRange(
          league.id,
          this.formatDate(today),
          this.formatDate(in7Days),
        );
        if (!fixtures?.length) continue;

        await this.upsertFixtures(fixtures);
      } catch (err: any) {
        this.logger.error(`Failed syncing fixtures for league ${league.id}: ${err.message}`);
      }
    }

    this.logger.log('Fixtures sync complete');
  }

  // ── Sync live scores ──────────────────────────────────────────────────────────

  @Cron('*/60 * * * * *') // every 60 seconds
  async syncLiveScores() {
    try {
      const fixtures = await this.api.getLiveFixtures();
      if (!fixtures?.length) return;

      this.logger.log(`Updating ${fixtures.length} live fixtures`);

      for (const item of fixtures) {
        const { fixture, goals, score } = item;
        const status = this.toMatchStatus(fixture.status.short);

        await this.prisma.match.updateMany({
          where: { api_football_id: fixture.id },
          data: {
            status,
            minute:       fixture.status.elapsed ?? null,
            home_score:   goals.home ?? null,
            away_score:   goals.away ?? null,
            home_ht_score: score.halftime.home ?? null,
            away_ht_score: score.halftime.away ?? null,
          },
        });
      }
    } catch (err: any) {
      this.logger.error(`Live scores sync failed: ${err.message}`);
    }
  }

  // ── Sync standings ────────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async syncStandings() {
    this.logger.log('Syncing standings...');

    for (const league of LEAGUE_IDS) {
      try {
        const rows = await this.api.getStandings(league.id);
        if (!rows?.length) continue;

        const dbLeague = await this.prisma.league.findUnique({ where: { api_football_id: league.id } });
        if (!dbLeague) continue;

        const season = await this.prisma.season.findFirst({
          where: { league_id: dbLeague.id, is_current: true },
        });
        if (!season) continue;

        for (const row of rows) {
          const team = await this.prisma.team.findUnique({ where: { api_football_id: row.team.id } });
          if (!team) continue;

          await this.prisma.standing.upsert({
            where:  { season_id_team_id: { season_id: season.id, team_id: team.id } },
            update: {
              position:      row.rank,
              played:        row.all.played,
              won:           row.all.win,
              drawn:         row.all.draw,
              lost:          row.all.lose,
              goals_for:     row.all.goals.for,
              goals_against: row.all.goals.against,
              goal_diff:     row.goalsDiff,
              points:        row.points,
              form:          row.form,
            },
            create: {
              season_id:     season.id,
              team_id:       team.id,
              position:      row.rank,
              played:        row.all.played,
              won:           row.all.win,
              drawn:         row.all.draw,
              lost:          row.all.lose,
              goals_for:     row.all.goals.for,
              goals_against: row.all.goals.against,
              goal_diff:     row.goalsDiff,
              points:        row.points,
              form:          row.form,
            },
          });
        }
      } catch (err: any) {
        this.logger.error(`Failed syncing standings for league ${league.id}: ${err.message}`);
      }
    }

    this.logger.log('Standings sync complete');
  }

  // ── Helper: upsert fixtures ───────────────────────────────────────────────────

  private async upsertFixtures(fixtures: any[]) {
    for (const item of fixtures) {
      const { fixture, league, teams, goals, score } = item;

      try {
        const homeTeam = await this.prisma.team.findUnique({ where: { api_football_id: teams.home.id } });
        const awayTeam = await this.prisma.team.findUnique({ where: { api_football_id: teams.away.id } });
        const dbLeague = await this.prisma.league.findUnique({ where: { api_football_id: league.id } });

        if (!homeTeam || !awayTeam || !dbLeague) continue;

        const season = await this.prisma.season.findFirst({
          where: { league_id: dbLeague.id, is_current: true },
        });
        if (!season) continue;

        const status = this.toMatchStatus(fixture.status.short);

        await this.prisma.match.upsert({
          where:  { api_football_id: fixture.id },
          update: {
            status,
            minute:        fixture.status.elapsed ?? null,
            home_score:    goals.home ?? null,
            away_score:    goals.away ?? null,
            home_ht_score: score.halftime.home ?? null,
            away_ht_score: score.halftime.away ?? null,
            venue:         fixture.venue?.name,
            referee:       fixture.referee,
          },
          create: {
            api_football_id: fixture.id,
            season_id:       season.id,
            home_team_id:    homeTeam.id,
            away_team_id:    awayTeam.id,
            kickoff_at:      new Date(fixture.date),
            status,
            venue:           fixture.venue?.name,
            referee:         fixture.referee,
          },
        });
      } catch (err: any) {
        this.logger.error(`Failed upserting fixture ${fixture.id}: ${err.message}`);
      }
    }
  }

  // ── Manual trigger (for testing) ─────────────────────────────────────────────

  async runFullSync() {
    this.logger.log('Running full sync...');
    await this.syncLeagues();
    await this.syncTeams();
    await this.syncFixtures();
    await this.syncStandings();
    this.logger.log('Full sync complete');
  }
}
