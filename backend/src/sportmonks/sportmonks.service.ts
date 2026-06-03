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
      // Auth goes as query param per SportMonks docs
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

  // /livescores/inplay returns ALL currently live fixtures
  async getLiveFixtures() {
    return this.getAll<any>('/livescores/inplay', {
      include: 'participants;scores;state;league',
    });
  }

  async getFixtureStatistics(fixtureId: number) {
    const res = await this.get<any>(`/fixtures/${fixtureId}`, {
      include: 'statistics',
    });
    return res?.statistics ?? [];
  }

  // ── Standings ─────────────────────────────────────────────────────────────────
  // Requires SportMonks season ID (not year)

  async getStandings(sportmonksSeasonId: number) {
    return this.getAll<any>(`/standings/seasons/${sportmonksSeasonId}`, {
      include: 'participant;details',
    });
  }
}
