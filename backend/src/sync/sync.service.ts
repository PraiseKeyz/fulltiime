import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SportMonksService } from '../sportmonks/sportmonks.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MatchStatus } from '../../generated/prisma/index.js';

// Short name overrides for known leagues
const SHORT_NAMES: Record<number, string> = {
  8:    'PL',
  82:   'BUN',
  384:  'SA',
  564:  'LL',
  711:  'CAF WCQ',
  714:  'AFC WCQ',
  717:  'CONCACAF',
  720:  'UEFA WCQ',
  723:  'OFC WCQ',
  726:  'CONMEBOL',
  729:  'WCQ PO',
  732:  'WC',
  1107: 'CAF CL',
};

// SportMonks state short codes → our MatchStatus
const STATUS_MAP: Record<string, MatchStatus> = {
  'LIVE':     MatchStatus.LIVE,
  'HT':       MatchStatus.HALFTIME,
  'ET':       MatchStatus.LIVE,
  'PEN_LIVE': MatchStatus.LIVE,
  'FT':       MatchStatus.FINISHED,
  'AET':      MatchStatus.FINISHED,
  'FT_PEN':   MatchStatus.FINISHED,
  'POSTP':    MatchStatus.POSTPONED,
  'CANCL':    MatchStatus.CANCELLED,
  'NS':       MatchStatus.SCHEDULED,
  'TBD':      MatchStatus.SCHEDULED,
};

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly api:    SportMonksService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private toMatchStatus(code: string): MatchStatus {
    return STATUS_MAP[code] ?? MatchStatus.SCHEDULED;
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private getParticipants(fixture: any) {
    const participants = fixture.participants ?? [];
    const home = participants.find((p: any) => p.meta?.location === 'home');
    const away = participants.find((p: any) => p.meta?.location === 'away');
    return { home, away };
  }

  private getCurrentScore(fixture: any) {
    const scores  = fixture.scores ?? [];
    const current = scores.filter((s: any) => s.description === 'CURRENT');
    const ht      = scores.filter((s: any) => s.description === 'HT');

    return {
      homeScore: current.find((s: any) => s.score?.participant === 'home')?.score?.goals ?? null,
      awayScore: current.find((s: any) => s.score?.participant === 'away')?.score?.goals ?? null,
      htHome:    ht.find((s: any) => s.score?.participant === 'home')?.score?.goals ?? null,
      htAway:    ht.find((s: any) => s.score?.participant === 'away')?.score?.goals ?? null,
    };
  }

  // ── Upsert country ───────────────────────────────────────────────────────────

  private async upsertCountry(name: string, code?: string, flagUrl?: string) {
    if (!name) return null;

    const existing = await this.prisma.country.findFirst({ where: { name } });
    if (existing) return existing;

    const safeCode     = (code || name.slice(0, 3)).toUpperCase();
    const codeConflict = await this.prisma.country.findFirst({ where: { code: safeCode } });
    const finalCode    = codeConflict
      ? `${name.slice(0, 2)}${Date.now().toString(36).slice(-3)}`.toUpperCase()
      : safeCode;

    try {
      return await this.prisma.country.create({
        data: { name, code: finalCode, flag_url: flagUrl },
      });
    } catch {
      return this.prisma.country.findFirst({ where: { name } });
    }
  }

  // ── Sync leagues ─────────────────────────────────────────────────────────────
  // Fetches ALL subscription leagues from SportMonks dynamically.
  // New leagues added to your plan are picked up automatically.
  // Leagues removed from your plan are marked is_active: false.

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async syncLeagues() {
    this.logger.log('Syncing leagues...');

    const apiLeagues = await this.api.getMyLeagues();
    if (!apiLeagues?.length) {
      this.logger.warn('No leagues returned from SportMonks');
      return;
    }

    const apiLeagueIds = apiLeagues.map(l => l.id);

    for (const league of apiLeagues) {
      try {
        const country      = league.country;
        const countryRecord = country?.name
          ? await this.upsertCountry(country.name, country.iso2, country.image_path)
          : null;

        await this.prisma.league.upsert({
          where:  { api_football_id: league.id },
          update: {
            name:       league.name,
            logo_url:   league.image_path,
            country_id: countryRecord?.id,
            is_active:  true,
          },
          create: {
            api_football_id: league.id,
            name:            league.name,
            short_name:      SHORT_NAMES[league.id] ?? league.short_code ?? null,
            logo_url:        league.image_path,
            country_id:      countryRecord?.id,
            is_active:       true,
          },
        });

        // currentseason is included in the league response — no separate API call needed
        const season = league.currentseason;
        if (season) {
          const dbLeague = await this.prisma.league.findUnique({ where: { api_football_id: league.id } });
          if (dbLeague) {
            const year = season.name ? parseInt(String(season.name).split('/')[0]) : new Date().getFullYear();
            await this.prisma.season.upsert({
              where:  { sportmonks_id: season.id },
              update: { is_current: true, year, league_id: dbLeague.id },
              create: {
                sportmonks_id: season.id,
                league_id:     dbLeague.id,
                year,
                start_date:    season.starting_at ? new Date(season.starting_at) : new Date(),
                end_date:      season.ending_at   ? new Date(season.ending_at)   : new Date(),
                is_current:    true,
              },
            });
          }
        }
      } catch (err: any) {
        this.logger.error(`Failed syncing league ${league.id} (${league.name}): ${err.message}`);
      }
    }

    // Mark leagues no longer in subscription as inactive
    await this.prisma.league.updateMany({
      where: {
        api_football_id: { notIn: apiLeagueIds },
        is_active:       true,
      },
      data: { is_active: false },
    });

    this.logger.log(`Leagues sync complete — ${apiLeagues.length} leagues processed`);
  }

  // ── Sync teams ───────────────────────────────────────────────────────────────

  @Cron('0 3 * * 1') // every Monday at 3am
  async syncTeams() {
    this.logger.log('Syncing teams...');

    const activeLeagues = await this.prisma.league.findMany({
      where:   { is_active: true },
      include: { seasons: { where: { is_current: true }, take: 1 } },
    });

    for (const league of activeLeagues) {
      const season = league.seasons[0];
      if (!season?.sportmonks_id) {
        this.logger.warn(`No current season for league ${league.name}, skipping`);
        continue;
      }

      try {
        const teams = await this.api.getTeamsBySeason(season.sportmonks_id);
        if (!teams?.length) continue;

        for (const team of teams) {
          const countryRecord = team.country?.name
            ? await this.upsertCountry(team.country.name, team.country.iso2)
            : null;

          await this.prisma.team.upsert({
            where:  { api_football_id: team.id },
            update: {
              name:       team.name,
              logo_url:   team.image_path,
              stadium:    team.venue?.name,
              venue_city: team.venue?.city?.name,
            },
            create: {
              api_football_id: team.id,
              name:            team.name,
              short_name:      team.short_code,
              code:            team.short_code,
              logo_url:        team.image_path,
              founded:         team.founded,
              stadium:         team.venue?.name,
              venue_city:      team.venue?.city?.name,
              country_id:      countryRecord?.id,
              is_active:       true,
            },
          });
        }

        this.logger.log(`Synced ${teams.length} teams for ${league.name}`);
      } catch (err: any) {
        this.logger.error(`Failed syncing teams for ${league.name}: ${err.message}`);
      }
    }

    this.logger.log('Teams sync complete');
  }

  // ── Sync fixtures ─────────────────────────────────────────────────────────────

  @Cron('0 */6 * * *') // every 6 hours
  async syncFixtures() {
    this.logger.log('Syncing fixtures...');

    const today    = new Date();
    const in14Days = new Date(today);
    in14Days.setDate(today.getDate() + 14);

    try {
      const fixtures = await this.api.getFixturesByDateRange(
        this.formatDate(today),
        this.formatDate(in14Days),
      );
      if (!fixtures?.length) {
        this.logger.log('No fixtures returned for next 7 days');
        return;
      }

      await this.upsertFixtures(fixtures);
      this.logger.log(`Fixtures sync complete — ${fixtures.length} fixtures processed`);
    } catch (err: any) {
      this.logger.error(`syncFixtures failed: ${err.message}`);
    }
  }

  // ── Sync live scores ──────────────────────────────────────────────────────────

  @Cron('*/5 * * * *') // every 5 minutes
  async syncLiveScores() {
    try {
      const fixtures = await this.api.getLiveFixtures();
      if (!fixtures?.length) return;

      this.logger.log(`Updating ${fixtures.length} live fixtures`);
      // Live payload already carries events, lineups and stats via includes
      await this.upsertFixtures(fixtures);
    } catch (err: any) {
      this.logger.error(`Live scores sync failed: ${err.message}`);
    }
  }

  // ── Sync standings ────────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async syncStandings() {
    this.logger.log('Syncing standings...');

    const activeLeagues = await this.prisma.league.findMany({
      where:   { is_active: true },
      include: { seasons: { where: { is_current: true }, take: 1 } },
    });

    for (const league of activeLeagues) {
      const season = league.seasons[0];
      if (!season?.sportmonks_id) continue;

      try {
        const rows = await this.api.getStandings(season.sportmonks_id);
        if (!rows?.length) continue;

        for (const row of rows) {
          const teamId = row.participant_id ?? row.participant?.id;
          const team   = await this.prisma.team.findUnique({ where: { api_football_id: teamId } });
          if (!team) continue;

          const d = row.details ?? {};
          await this.prisma.standing.upsert({
            where:  { season_id_team_id: { season_id: season.id, team_id: team.id } },
            update: {
              position:      row.position,
              played:        d.games_played    ?? 0,
              won:           d.won             ?? 0,
              drawn:         d.draw            ?? 0,
              lost:          d.lost            ?? 0,
              goals_for:     d.goals_scored    ?? 0,
              goals_against: d.goals_conceded  ?? 0,
              goal_diff:     d.goal_difference ?? 0,
              points:        row.points        ?? 0,
              form:          row.form          ?? null,
            },
            create: {
              season_id:     season.id,
              team_id:       team.id,
              position:      row.position,
              played:        d.games_played    ?? 0,
              won:           d.won             ?? 0,
              drawn:         d.draw            ?? 0,
              lost:          d.lost            ?? 0,
              goals_for:     d.goals_scored    ?? 0,
              goals_against: d.goals_conceded  ?? 0,
              goal_diff:     d.goal_difference ?? 0,
              points:        row.points        ?? 0,
              form:          row.form          ?? null,
            },
          });
        }

        this.logger.log(`Synced standings for ${league.name}`);
      } catch (err: any) {
        this.logger.error(`Failed syncing standings for ${league.name}: ${err.message}`);
      }
    }

    this.logger.log('Standings sync complete');
  }

  // ── Upsert fixtures ───────────────────────────────────────────────────────────

  private async upsertFixtures(fixtures: any[]) {
    for (const fixture of fixtures) {
      try {
        const { home, away } = this.getParticipants(fixture);
        if (!home || !away) continue;

        const homeTeam = await this.prisma.team.findUnique({ where: { api_football_id: home.id } });
        const awayTeam = await this.prisma.team.findUnique({ where: { api_football_id: away.id } });
        if (!homeTeam || !awayTeam) continue;

        const leagueApiId = fixture.league_id ?? fixture.league?.id;
        const dbLeague    = await this.prisma.league.findUnique({ where: { api_football_id: leagueApiId } });
        if (!dbLeague) continue;

        const season = await this.prisma.season.findFirst({
          where: { league_id: dbLeague.id, is_current: true },
        });
        if (!season) continue;

        const stateCode = fixture.state?.short_name ?? fixture.state?.state ?? 'NS';
        const status    = this.toMatchStatus(stateCode);
        const { homeScore, awayScore, htHome, htAway } = this.getCurrentScore(fixture);
        const minute    = fixture.periods?.find((p: any) => p.ticking)?.minutes ?? null;

        // Formations — match by participant id
        const formations = fixture.formations ?? [];
        const homeFormation = formations.find((f: any) => f.participant_id === home.id)?.formation ?? null;
        const awayFormation = formations.find((f: any) => f.participant_id === away.id)?.formation ?? null;

        const dbMatch = await this.prisma.match.upsert({
          where:  { api_football_id: fixture.id },
          update: {
            status,
            minute,
            home_score:     homeScore,
            away_score:     awayScore,
            home_ht_score:  htHome,
            away_ht_score:  htAway,
            venue:          fixture.venue?.name ?? null,
            home_formation: homeFormation,
            away_formation: awayFormation,
          },
          create: {
            api_football_id: fixture.id,
            season_id:       season.id,
            home_team_id:    homeTeam.id,
            away_team_id:    awayTeam.id,
            kickoff_at:      new Date(fixture.starting_at),
            status,
            venue:           fixture.venue?.name ?? null,
            home_formation:  homeFormation,
            away_formation:  awayFormation,
          },
        });

        // Map SportMonks participant/team id → our team record
        const teamByApiId = new Map<number, string>([
          [home.id, homeTeam.id],
          [away.id, awayTeam.id],
        ]);

        if (fixture.events?.length)     await this.upsertEvents(dbMatch.id, fixture.events, teamByApiId);
        if (fixture.lineups?.length)    await this.upsertLineups(dbMatch.id, fixture.lineups, teamByApiId);
        if (fixture.statistics?.length) await this.upsertStats(dbMatch.id, fixture.statistics, teamByApiId);
      } catch (err: any) {
        this.logger.error(`Failed upserting fixture ${fixture.id}: ${err.message}`);
      }
    }
  }

  // ── Upsert events (goals, cards, subs) ──────────────────────────────────────────

  private async upsertEvents(matchId: string, events: any[], teamByApiId: Map<number, string>) {
    for (const ev of events) {
      try {
        const type = ev.type?.name ?? this.eventTypeName(ev.type_id);
        await this.prisma.matchEvent.upsert({
          where:  { sportmonks_id: ev.id },
          update: {
            type,
            minute:              ev.minute ?? 0,
            extra_minute:        ev.extra_minute ?? null,
            team_id:             teamByApiId.get(ev.participant_id) ?? null,
            player_name:         ev.player_name ?? null,
            related_player_name: ev.related_player_name ?? null,
            detail:              ev.addition ?? ev.info ?? ev.result ?? null,
            sort_order:          ev.sort_order ?? null,
          },
          create: {
            sportmonks_id:       ev.id,
            match_id:            matchId,
            type,
            minute:              ev.minute ?? 0,
            extra_minute:        ev.extra_minute ?? null,
            team_id:             teamByApiId.get(ev.participant_id) ?? null,
            player_name:         ev.player_name ?? null,
            related_player_name: ev.related_player_name ?? null,
            detail:              ev.addition ?? ev.info ?? ev.result ?? null,
            sort_order:          ev.sort_order ?? null,
          },
        });
      } catch (err: any) {
        this.logger.error(`Failed upserting event ${ev.id}: ${err.message}`);
      }
    }
  }

  // ── Upsert lineups (starting XI + bench) ────────────────────────────────────────

  private async upsertLineups(matchId: string, lineups: any[], teamByApiId: Map<number, string>) {
    for (const lp of lineups) {
      try {
        const teamId = teamByApiId.get(lp.team_id);
        if (!teamId) continue;

        // type_id 11 = starting XI, 12 = bench
        const isStarting = lp.type_id === 11 || lp.type?.name?.toLowerCase() === 'lineup';

        await this.prisma.matchLineup.upsert({
          where:  { sportmonks_id: lp.id },
          update: {
            player_name:     lp.player_name ?? lp.player?.display_name ?? 'Unknown',
            player_photo:    lp.player?.image_path ?? null,
            jersey_number:   lp.jersey_number ?? null,
            position:        lp.position?.name ?? null,
            formation_field: lp.formation_field ?? null,
            is_starting:     isStarting,
          },
          create: {
            sportmonks_id:        lp.id,
            match_id:             matchId,
            team_id:              teamId,
            player_name:          lp.player_name ?? lp.player?.display_name ?? 'Unknown',
            player_photo:         lp.player?.image_path ?? null,
            jersey_number:        lp.jersey_number ?? null,
            position:             lp.position?.name ?? null,
            formation_field:      lp.formation_field ?? null,
            is_starting:          isStarting,
            sportmonks_player_id: lp.player_id ?? null,
          },
        });
      } catch (err: any) {
        this.logger.error(`Failed upserting lineup ${lp.id}: ${err.message}`);
      }
    }
  }

  // ── Upsert statistics (flat per-team rows) ──────────────────────────────────────

  private async upsertStats(matchId: string, stats: any[], teamByApiId: Map<number, string>) {
    for (const [apiTeamId, dbTeamId] of teamByApiId.entries()) {
      const find = (typeId: number) => {
        const row = stats.find(s => s.participant_id === apiTeamId && s.type_id === typeId);
        const v = row?.data?.value;
        return typeof v === 'number' ? v : null;
      };

      // Only write if this team actually has stat rows
      if (!stats.some(s => s.participant_id === apiTeamId)) continue;

      try {
        await this.prisma.matchStatistic.upsert({
          where:  { match_id_team_id: { match_id: matchId, team_id: dbTeamId } },
          update: {
            possession:      find(45),
            shots:           find(42),
            shots_on_target: find(86),
            xg:              find(5304),
            corners:         find(34),
            fouls:           find(56),
            yellow_cards:    find(84),
            red_cards:       find(83),
          },
          create: {
            match_id:        matchId,
            team_id:         dbTeamId,
            possession:      find(45),
            shots:           find(42),
            shots_on_target: find(86),
            xg:              find(5304),
            corners:         find(34),
            fouls:           find(56),
            yellow_cards:    find(84),
            red_cards:       find(83),
          },
        });
      } catch (err: any) {
        this.logger.error(`Failed upserting stats for team ${dbTeamId}: ${err.message}`);
      }
    }
  }

  // ── Fetch + sync a single fixture's full detail (finished / on-demand) ──────────

  async syncFixtureDetail(apiFixtureId: number) {
    const fixture = await this.api.getFixtureById(apiFixtureId);
    if (!fixture) return;
    await this.upsertFixtures([fixture]);
  }

  // SportMonks event type_id → readable name (fallback when type include missing)
  private eventTypeName(typeId: number): string {
    const map: Record<number, string> = {
      14: 'Goal', 15: 'Goal', 16: 'Penalty', 17: 'Own Goal',
      18: 'Substitution', 19: 'Yellow Card', 20: 'Red Card', 21: 'Yellow Red Card',
      52: 'Goal', 83: 'Substitution',
    };
    return map[typeId] ?? 'Event';
  }

  // ── Manual trigger ────────────────────────────────────────────────────────────

  async runFullSync() {
    this.logger.log('Running full sync...');
    await this.syncLeagues();
    await this.syncTeams();
    await this.syncFixtures();
    await this.syncStandings();
    this.logger.log('Full sync complete');
  }
}
