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

// SportMonks state `short_name` codes → our MatchStatus.
// In-play halves come through as '1st'/'2nd' (NOT 'LIVE'), which is why a live
// match would otherwise map to SCHEDULED. Map every in-play code to LIVE.
const STATUS_MAP: Record<string, MatchStatus> = {
  // In play
  'INPLAY':    MatchStatus.LIVE,
  'LIVE':      MatchStatus.LIVE,
  '1st':       MatchStatus.LIVE,
  '2nd':       MatchStatus.LIVE,
  'ET':        MatchStatus.LIVE,
  'BREAK':     MatchStatus.LIVE,
  'ET_BREAK':  MatchStatus.LIVE,
  'PEN_BREAK': MatchStatus.LIVE,
  'PEN_LIVE':  MatchStatus.LIVE,
  'HT':        MatchStatus.HALFTIME,
  // Play stopped, match not over — SportMonks state for a stoppage (weather,
  // crowd trouble, injury, etc). Without these, an unmapped code falls back
  // to SCHEDULED, which the fromLiveFeed safety-net below then force-bumps
  // back to LIVE — making an interrupted match look like it's still ticking.
  'INT':       MatchStatus.INTERRUPTED,
  'SUSP':      MatchStatus.INTERRUPTED,
  // Finished
  'FT':        MatchStatus.FINISHED,
  'AET':       MatchStatus.FINISHED,
  'FT_PEN':    MatchStatus.FINISHED,
  // Not started / disrupted
  'NS':        MatchStatus.SCHEDULED,
  'TBA':       MatchStatus.SCHEDULED,
  'TBD':       MatchStatus.SCHEDULED,
  'POSTP':     MatchStatus.POSTPONED,
  'CANCL':     MatchStatus.CANCELLED,
};

// SportMonks returns datetimes as timezone-less UTC strings, e.g. "2026-06-11 19:00:00".
// Passing those straight to `new Date()` parses them in the SERVER's local timezone, which
// shifts every kickoff by the offset whenever the box isn't UTC (e.g. a WAT/+1 dev machine
// stores kickoffs an hour early). Parse them explicitly as UTC instead.
function smUtcDate(value: string): Date {
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasZone ? value : value.replace(' ', 'T') + 'Z');
}

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
            sub_type:   league.sub_type ?? null,
            is_active:  true,
          },
          create: {
            api_football_id: league.id,
            name:            league.name,
            short_name:      SHORT_NAMES[league.id] ?? league.short_code ?? null,
            logo_url:        league.image_path,
            country_id:      countryRecord?.id,
            sub_type:        league.sub_type ?? null,
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
                start_date:    season.starting_at ? smUtcDate(season.starting_at) : new Date(),
                end_date:      season.ending_at   ? smUtcDate(season.ending_at)   : new Date(),
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

  // ── Sync venues ───────────────────────────────────────────────────────────────

  @Cron('0 4 * * 1') // every Monday at 4am
  async syncVenues() {
    this.logger.log('Syncing venues...');

    // Only domestic leagues + international cups (World Cup, CAF CL). The global
    // qualifiers reference hundreds of venues worldwide and time out — and we
    // don't surface those venues anyway.
    const activeLeagues = await this.prisma.league.findMany({
      where:   { is_active: true, sub_type: { in: ['domestic', 'cup_international'] } },
      include: { seasons: { where: { is_current: true }, take: 1 } },
    });

    const seen = new Set<number>(); // a venue can appear across leagues

    for (const league of activeLeagues) {
      const season = league.seasons[0];
      if (!season?.sportmonks_id) continue;

      try {
        const venues = await this.api.getVenuesBySeason(season.sportmonks_id);
        for (const v of venues ?? []) {
          if (!v?.id || seen.has(v.id)) continue;
          seen.add(v.id);

          const data = {
            name:      v.name,
            city:      v.city_name ?? v.city?.name ?? null,
            country:   v.country?.name ?? null,
            address:   v.address ?? null,
            capacity:  v.capacity ?? null,
            surface:   v.surface ?? null,
            image_url: v.image_path ?? null,
            latitude:  v.latitude  != null ? parseFloat(v.latitude)  : null,
            longitude: v.longitude != null ? parseFloat(v.longitude) : null,
          };

          await this.prisma.venue.upsert({
            where:  { sportmonks_id: v.id },
            update: data,
            create: { sportmonks_id: v.id, ...data },
          });
        }
      } catch (err: any) {
        this.logger.error(`Failed syncing venues for ${league.name}: ${err.message}`);
      }
    }

    this.logger.log(`Venues sync complete — ${seen.size} venues`);
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

      await this.syncLineups();
    } catch (err: any) {
      this.logger.error(`syncFixtures failed: ${err.message}`);
    }
  }

  async syncLineups() {
    const since = new Date();
    since.setHours(since.getHours() - 48);

    const matches = await this.prisma.match.findMany({
      where: {
        api_football_id: { not: null },
        OR: [
          // Already-started matches: only worth re-fetching if we're still missing
          // lineups entirely — the live cron keeps live ones fresh on its own, and
          // finished-match rosters don't change after the fact.
          { status: { in: [MatchStatus.LIVE, MatchStatus.HALFTIME, MatchStatus.INTERRUPTED, MatchStatus.FINISHED] }, kickoff_at: { gte: since }, lineups: { none: {} } },
          // Scheduled matches: always re-check, even if we already have a lineup —
          // SportMonks can publish/correct predicted XIs in the days before kickoff,
          // and upsertLineups will overwrite existing rows with the latest data.
          { status: MatchStatus.SCHEDULED },
        ],
      },
      select: { id: true, api_football_id: true },
    });

    if (!matches.length) {
      this.logger.log('No matches need a lineup check');
      return;
    }

    this.logger.log(`Checking lineups for ${matches.length} match(es)...`);
    for (const match of matches) {
      try {
        await this.syncFixtureDetail(match.api_football_id!);
      } catch (err: any) {
        this.logger.error(`Failed syncing lineups for match ${match.id}: ${err.message}`);
      }
    }

    this.logger.log('Lineups check complete');
  }

  // ── Sync live scores ──────────────────────────────────────────────────────────

  @Cron('*/1 * * * *') // every 1 minute
  async syncLiveScores() {
    try {
      const previouslyLive = await this.prisma.match.findMany({
        where:  { status: { in: [MatchStatus.LIVE, MatchStatus.HALFTIME, MatchStatus.INTERRUPTED] } },
        select: { api_football_id: true },
      });
      const prevLiveApiIds = previouslyLive
        .map(m => m.api_football_id)
        .filter((id): id is number => id !== null);

      const fixtures = await this.api.getLiveFixtures();
      if (fixtures?.length) {
        this.logger.log(`Processing ${fixtures.length} fixture(s) from the live feed`);
        await this.upsertFixtures(fixtures, true);

        for (const f of fixtures) {
          await this.syncCommentary(f.id);
        }
      }

      const liveFeedIds = new Set((fixtures ?? []).map((f: any) => f.id));
      const droppedIds  = prevLiveApiIds.filter(id => !liveFeedIds.has(id));
      for (const id of droppedIds) {
        try {
          await this.syncFixtureDetail(id);
        } catch (e: any) {
          this.logger.error(`Failed re-syncing dropped fixture ${id}: ${e.message}`);
        }
      }

      if (prevLiveApiIds.length > 0) {
        const justFinished = await this.prisma.match.findMany({
          where:  { api_football_id: { in: prevLiveApiIds }, status: MatchStatus.FINISHED },
          select: { season: { select: { league_id: true } } },
        });
        if (justFinished.length > 0) {
          const leagueIds = [...new Set(justFinished.map(m => m.season.league_id))];
          this.logger.log(`${justFinished.length} match(es) just finished — syncing standings for ${leagueIds.length} league(s)`);
          this.syncStandingsForLeagues(leagueIds).catch(e =>
            this.logger.error(`Post-match standings sync failed: ${e.message}`),
          );
          
          setTimeout(() => {
            this.syncStandingsForLeagues(leagueIds).catch(e =>
              this.logger.error(`Delayed standings re-check failed: ${e.message}`),
            );
          }, 5 * 60 * 1000);
        }
      }
    } catch (err: any) {
      this.logger.error(`Live scores sync failed: ${err.message}`);
    }
  }

  // ── Sync commentary (play-by-play text feed) ────────────────────────────────
  async syncCommentary(apiFixtureId: number) {
    try {
      const match = await this.prisma.match.findUnique({
        where:  { api_football_id: apiFixtureId },
        select: { id: true },
      });
      if (!match) return;

      const raw = await this.api.getCommentariesByFixtureId(apiFixtureId);
      if (!raw?.length) return;

      await this.prisma.matchCommentary.createMany({
        data: (raw as any[]).map((c) => ({
          sportmonks_id: BigInt(c.id),
          match_id:      match.id,
          minute:        c.minute ?? null,
          extra_minute:  c.extra_minute ?? null,
          comment:       c.comment ?? '',
          is_goal:       !!c.is_goal,
          is_important:  !!c.is_important,
          order:         c.order ?? 0,
          player_name:   c.player?.display_name ?? c.player?.name ?? null,
        })),
        skipDuplicates: true,
      });
    } catch (err: any) {
      this.logger.error(`Failed syncing commentary for fixture ${apiFixtureId}: ${err.message}`);
    }
  }

  private parseStandingDetails(details: any[]) {
    // Normalise the type identifier; separators vary (_, -, space) across plans.
    const codeOf = (d: any) =>
      String(d.type?.developer_name ?? d.type?.code ?? d.type?.name ?? '')
        .toLowerCase()
        .replace(/[\s_]+/g, '-');

    const pick = (match: (c: string) => boolean) => {
      const row = details.find(d => match(codeOf(d)));
      const v = row?.value;
      return typeof v === 'number' ? v : Number(v) || 0;
    };

    const overall = (c: string) => !c.includes('home') && !c.includes('away');

    const played       = pick(c => overall(c) && (c.includes('played') || c.includes('matches') || c.includes('games')));
    const won          = pick(c => overall(c) && (c.includes('won') || c.includes('win')));
    const drawn        = pick(c => overall(c) && c.includes('draw'));
    const lost         = pick(c => overall(c) && (c.includes('lost') || c.includes('lose')));
    const goalsFor     = pick(c => overall(c) && (c.includes('scored') || (c.includes('goal') && c.includes('for'))));
    const goalsAgainst = pick(c => overall(c) && (c.includes('conceded') || (c.includes('goal') && c.includes('against'))));
    const goalDiff     = goalsFor - goalsAgainst;

    return { played, won, drawn, lost, goalsFor, goalsAgainst, goalDiff };
  }

  // ── Sync standings ────────────────────────────────────────────────────────────

  @Cron('0 */2 * * *')
  async syncStandings() {
    this.logger.log('Standings safety-net sweep...');
    const leagues = await this.prisma.league.findMany({ where: { is_active: true }, select: { id: true } });
    await this.syncStandingsForLeagues(leagues.map(l => l.id));
    this.logger.log('Standings sweep complete');
  }

  private async syncStandingsForLeagues(leagueIds: string[]) {
    if (!leagueIds.length) return;

    const leagues = await this.prisma.league.findMany({
      where:   { id: { in: leagueIds }, is_active: true },
      include: { seasons: { where: { is_current: true }, take: 1 } },
    });

    for (const league of leagues) {
      const season = league.seasons[0];
      if (!season?.sportmonks_id) continue;

      try {
        const rows = await this.api.getStandings(season.sportmonks_id);
        if (!rows?.length) continue;

        for (const row of rows) {
          const teamId = row.participant_id ?? row.participant?.id;
          const team   = await this.prisma.team.findUnique({ where: { api_football_id: teamId } });
          if (!team) continue;

          const s = this.parseStandingDetails(row.details ?? []);
          const data = {
            position:      row.position,
            played:        s.played,
            won:           s.won,
            drawn:         s.drawn,
            lost:          s.lost,
            goals_for:     s.goalsFor,
            goals_against: s.goalsAgainst,
            goal_diff:     s.goalDiff,
            points:        row.points ?? 0,
            form:          row.form ?? null,
            group:         row.group?.name ?? null,
          };

          await this.prisma.standing.upsert({
            where:  { season_id_team_id: { season_id: season.id, team_id: team.id } },
            update: data,
            create: { season_id: season.id, team_id: team.id, ...data },
          });
        }

        this.logger.log(`Synced standings for ${league.name}`);
      } catch (err: any) {
        this.logger.error(`Failed syncing standings for ${league.name}: ${err.message}`);
      }
    }
  }

  // ── Upsert fixtures ───────────────────────────────────────────────────────────

  private async upsertFixtures(fixtures: any[], fromLiveFeed = false) {
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
        let status      = this.toMatchStatus(stateCode);
        const { homeScore, awayScore, htHome, htAway } = this.getCurrentScore(fixture);
        const tickingPeriod    = fixture.periods?.find((p: any) => p.ticking);
        const rawMinutes       = tickingPeriod?.minutes ?? null;
        const pLength          = tickingPeriod?.period_length ?? 45;
        const normalEnd        = tickingPeriod
          ? (tickingPeriod.counts_from ?? 0) + pLength
          : null;
        const inStoppage       = rawMinutes !== null && normalEnd !== null && rawMinutes > normalEnd;
        let minute             = inStoppage ? normalEnd : rawMinutes;
        let extraMinute        = inStoppage ? rawMinutes - normalEnd : null;
        const periodStartedAt  = tickingPeriod?.started   != null ? Number(tickingPeriod.started)    : null;
        const periodCountsFrom = tickingPeriod?.counts_from != null ? Number(tickingPeriod.counts_from) : null;
        const periodLen        = tickingPeriod != null ? pLength : null;

        if (fromLiveFeed && status === MatchStatus.SCHEDULED) {
          const elapsedMs = Date.now() - smUtcDate(fixture.starting_at).getTime();
          if (elapsedMs >= 0 && elapsedMs <= 3 * 60 * 60 * 1000) {
            status      = MatchStatus.LIVE;
            minute      = minute ?? Math.max(1, Math.floor(elapsedMs / 60_000));
            extraMinute = extraMinute ?? null;
          }
        }

        // Formations — match by participant id
        const formations = fixture.formations ?? [];
        const homeFormation = formations.find((f: any) => f.participant_id === home.id)?.formation ?? null;
        const awayFormation = formations.find((f: any) => f.participant_id === away.id)?.formation ?? null;

        // Link to our stored Venue (synced separately) by SportMonks venue id
        const venueId = fixture.venue_id
          ? (await this.prisma.venue.findUnique({ where: { sportmonks_id: fixture.venue_id } }))?.id ?? null
          : null;

        const dbMatch = await this.prisma.match.upsert({
          where:  { api_football_id: fixture.id },
          update: {
            status,
            minute,
            extra_minute:       extraMinute,
            period_started_at:  periodStartedAt,
            period_counts_from: periodCountsFrom,
            period_length:      periodLen,
            kickoff_at:         smUtcDate(fixture.starting_at),
            home_score:         homeScore,
            away_score:         awayScore,
            home_ht_score:      htHome,
            away_ht_score:      htAway,
            venue:              fixture.venue?.name ?? null,
            venue_id:           venueId,
            home_formation:     homeFormation,
            away_formation:     awayFormation,
          },
          create: {
            api_football_id: fixture.id,
            season_id:       season.id,
            home_team_id:    homeTeam.id,
            away_team_id:    awayTeam.id,
            kickoff_at:      smUtcDate(fixture.starting_at),
            status,
            venue:           fixture.venue?.name ?? null,
            venue_id:        venueId,
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
          where:  { sportmonks_id: BigInt(ev.id) },
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
            sportmonks_id:       BigInt(ev.id),
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
          where:  { sportmonks_id: BigInt(lp.id) },
          update: {
            player_name:     lp.player_name ?? lp.player?.display_name ?? 'Unknown',
            player_photo:    lp.player?.image_path ?? null,
            jersey_number:   lp.jersey_number ?? null,
            position:        lp.position?.name ?? null,
            formation_field: lp.formation_field ?? null,
            is_starting:     isStarting,
          },
          create: {
            sportmonks_id:        BigInt(lp.id),
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

  @Cron('0 4 * * *') // daily at 4am
  async syncTeamForm() {
    const teams = await this.prisma.team.findMany({
      where:  { api_football_id: { not: null }, is_active: true },
      select: { id: true, api_football_id: true },
    });

    this.logger.log(`Syncing team form for ${teams.length} teams...`);

    for (const team of teams) {
      try {
        const fixtures = await this.api.getTeamRecentFixtures(team.api_football_id!);
        const finished = fixtures
          .filter((f: any) => {
            const code = f.state?.short_name ?? f.state?.state ?? '';
            return ['FT', 'AET', 'FT_PEN'].includes(code);
          })
          .slice(0, 5);

        if (!finished.length) continue;

        // Delete existing form entries for this team, then re-insert fresh
        await this.prisma.teamForm.deleteMany({ where: { team_id: team.id } });

        for (const f of finished) {
          const { home, away } = this.getParticipants(f);
          if (!home || !away) continue;

          const isHome    = home.id === team.api_football_id;
          const opponentApiId = isHome ? away.id : home.id;
          const opponent  = await this.prisma.team.findUnique({ where: { api_football_id: opponentApiId } });
          if (!opponent) continue;

          const scores  = (f.scores ?? []).filter((s: any) => s.description === 'CURRENT');
          const goals   = (loc: string) =>
            scores.find((s: any) => s.score?.participant === loc)?.score?.goals ?? null;

          const homeScore = goals('home');
          const awayScore = goals('away');
          if (homeScore == null || awayScore == null) continue;

          await this.prisma.teamForm.create({
            data: {
              team_id:     team.id,
              opponent_id: opponent.id,
              is_home:     isHome,
              home_score:  homeScore,
              away_score:  awayScore,
              kickoff_at:  smUtcDate(f.starting_at),
              league_name: f.league?.name ?? null,
              league_logo: f.league?.image_path ?? null,
            },
          });
        }
      } catch (err: any) {
        this.logger.error(`Failed syncing form for team ${team.api_football_id}: ${err.message}`);
      }
    }

    this.logger.log('Team form sync complete');
  }

  // ── Sync H2H (pre-populate cache for all known team pairs) ──────────────────
  @Cron('0 3 * * 0') // weekly, Sunday 3am
  async syncH2H() {
    const matches = await this.prisma.match.findMany({
      where: {
        home_team: { api_football_id: { not: null } },
        away_team: { api_football_id: { not: null } },
      },
      select: {
        home_team: { select: { api_football_id: true } },
        away_team: { select: { api_football_id: true } },
      },
    });

    // Deduplicate team pairs — sort ids so A-vs-B and B-vs-A map to the same key
    const pairMap = new Map<string, [number, number]>();
    for (const m of matches) {
      const a = m.home_team.api_football_id!;
      const b = m.away_team.api_football_id!;
      const [lo, hi] = a < b ? [a, b] : [b, a];
      pairMap.set(`${lo}:${hi}`, [lo, hi]);
    }

    const pairs = [...pairMap.values()];
    this.logger.log(`Syncing H2H for ${pairs.length} team pair(s)...`);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    for (const [a, b] of pairs) {
      try {
        const raw = await this.api.getHeadToHead(a, b);

        const rawMeetings = raw
          .map((f: any) => {
            const parts = f.participants ?? [];
            const home  = parts.find((p: any) => p.meta?.location === 'home');
            const away  = parts.find((p: any) => p.meta?.location === 'away');
            if (!home || !away) return null;
            const scores = (f.scores ?? []).filter((s: any) => s.description === 'CURRENT');
            const goals  = (loc: string) =>
              scores.find((s: any) => s.score?.participant === loc)?.score?.goals ?? null;
            return {
              id:          f.id,
              date:        f.starting_at ?? null,
              league:      f.league ? { name: f.league.name, logo: f.league.image_path } : null,
              homeTeam:    { name: home.name, logo: home.image_path ?? null },
              awayTeam:    { name: away.name, logo: away.image_path ?? null },
              homeScore:   goals('home'),
              awayScore:   goals('away'),
              homeIsApiId: home.id,
            };
          })
          .filter((m: any): m is NonNullable<typeof m> => m !== null)
          .sort((x: any, y: any) => +new Date(y.date ?? 0) - +new Date(x.date ?? 0));

        await this.prisma.cache.upsert({
          where:  { key: `h2h:${a}:${b}` },
          update: { payload: { rawMeetings } as any, expires_at: expiresAt },
          create: { key: `h2h:${a}:${b}`, payload: { rawMeetings } as any, expires_at: expiresAt },
        });
      } catch (err: any) {
        this.logger.error(`Failed syncing H2H for ${a}:${b}: ${err.message}`);
      }
    }

    this.logger.log('H2H sync complete');
  }

  async runFullSync() {
    this.logger.log('Running full sync...');
    await this.syncLeagues();
    await this.syncTeams();
    await this.syncVenues();
    await this.syncFixtures();
    await this.syncStandings();
    await this.syncTeamForm();
    await this.syncH2H();
    this.logger.log('Full sync complete');
  }
}
