import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SportMonksService {
  private readonly logger = new Logger(SportMonksService.name);
  private readonly http: AxiosInstance;

  constructor(private config: ConfigService) {
    this.http = axios.create({
      baseURL: 'https://api.sportmonks.com/v3/football',
      params: { api_token: this.config.get('SPORTMONKS_API_KEY') },
      timeout: 15_000,
    });
  }

  // ── Core helpers ──────────────────────────────────────────────────────────────

  private async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T | null> {
    try {
      const { data } = await this.http.get(endpoint, { params });
      return data.data as T;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message;
      this.logger.error(`SportMonks [${endpoint}]: ${msg}`);
      return null;
    }
  }

  private async getAll<T>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> {
    const results: T[] = [];
    let page = 1;

    while (true) {
      try {
        const { data: res } = await this.http.get(endpoint, { params: { ...params, page } });
        results.push(...(res.data ?? []));
        if (!res.pagination?.has_more) break;
        page++;
      } catch (err: any) {
        const msg = err.response?.data?.message ?? err.message;
        this.logger.error(`SportMonks paginated [${endpoint}] page ${page}: ${msg}`);
        break;
      }
    }

    return results;
  }

  // ── Leagues ───────────────────────────────────────────────────────────────────
  // GET /leagues returns only leagues within your subscription — no filtering needed

  // currentSeason is included directly — no separate season API calls needed
  async getMyLeagues() {
    return this.getAll<any>('/leagues', { include: 'country;currentSeason' });
  }

  // ── Teams ─────────────────────────────────────────────────────────────────────
  // Requires SportMonks season ID (not year)

  async getTeamsBySeason(sportmonksSeasonId: number) {
    return this.getAll<any>(`/teams/seasons/${sportmonksSeasonId}`, {
      include: 'country;venue',
    });
  }

  // ── Fixtures ──────────────────────────────────────────────────────────────────

  async getFixturesByDateRange(from: string, to: string) {
    return this.getAll<any>(`/fixtures/between/${from}/${to}`, {
      include: 'participants;scores;state;league;venue',
    });
  }

  // Full detail include string — events, lineups, stats, formations all in one call
  private readonly DETAIL_INCLUDE =
    'participants;scores;state;league;venue;periods;' +
    'events.type;lineups.player;lineups.type;statistics.type;formations';

  // /livescores/inplay returns ALL currently live fixtures, enriched with detail
  async getLiveFixtures() {
    return this.getAll<any>('/livescores/inplay', {
      include: this.DETAIL_INCLUDE,
    });
  }

  // Single fixture with full detail (used for finished matches / on-demand)
  async getFixtureById(fixtureId: number) {
    return this.get<any>(`/fixtures/${fixtureId}`, {
      include: this.DETAIL_INCLUDE,
    });
  }

  // /fixtures/teams/{id} endpoint is not available on all plans.
  async getTeamRecentFixtures(teamId: number): Promise<any[]> {
    const to   = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.getAll<any>(`/fixtures/between/${from}/${to}/${teamId}`, {
      include: 'participants;scores;state;league;venue',
    });
  }

  // Lightweight fixture for a preview page (placeholder knockout ties etc.)
  async getFixturePreview(fixtureId: number) {
    return this.get<any>(`/fixtures/${fixtureId}`, {
      include: 'participants;league;venue;stage',
    });
  }

  // Past meetings between two teams, most recent first (SportMonks default order)
  async getHeadToHead(team1Id: number, team2Id: number) {
    return this.getAll<any>(`/fixtures/head-to-head/${team1Id}/${team2Id}`, {
      include: 'participants;scores;league',
    });
  }

  // ── Standings ─────────────────────────────────────────────────────────────────
  // Requires SportMonks season ID (not year)

  async getStandings(sportmonksSeasonId: number) {
    return this.getAll<any>(`/standings/seasons/${sportmonksSeasonId}`, {
      include: 'participant;details.type;group',
    });
  }

  // ── Brackets (knockout structure) ─────────────────────────────────────────────
  // Returns { stages: [...], edges: [...] } for a season's knockout phase.

  async getBrackets(sportmonksSeasonId: number) {
    return this.get<any>(`/seasons/${sportmonksSeasonId}/brackets`);
  }

  // ── Venues ────────────────────────────────────────────────────────────────────
  // Per-season (avoids paginating the full venue list); include country for name.

  async getVenuesBySeason(sportmonksSeasonId: number) {
    return this.getAll<any>(`/venues/seasons/${sportmonksSeasonId}`, {
      include: 'country',
    });
  }
}
