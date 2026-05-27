import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ApiFootballService {
  private readonly logger = new Logger(ApiFootballService.name);
  private readonly http: AxiosInstance;
  private readonly season: number;

  constructor(private config: ConfigService) {
    this.season = parseInt(this.config.get('API_FOOTBALL_SEASON', '2025'), 10);

    this.http = axios.create({
      baseURL: this.config.get('API_FOOTBALL_BASE_URL', 'https://v3.football.api-sports.io'),
      headers: {
        'x-apisports-key': this.config.get('API_FOOTBALL_KEY'),
      },
      timeout: 10_000,
    });
  }

  private async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const { data } = await this.http.get(endpoint, { params });

      if (data.errors && Object.keys(data.errors).length > 0) {
        this.logger.error(`API-Football error on ${endpoint}: ${JSON.stringify(data.errors)}`);
        return null as T;
      }

      return data.response as T;
    } catch (err: any) {
      this.logger.error(`API-Football request failed [${endpoint}]: ${err.message}`);
      return null as T;
    }
  }

  // ── Leagues ────────────────────────────────────────────────────────────────

  async getLeague(leagueId: number) {
    const res = await this.get<any[]>('/leagues', { id: leagueId, season: this.season });
    return res?.[0] ?? null;
  }

  // ── Teams ──────────────────────────────────────────────────────────────────

  async getTeams(leagueId: number) {
    return this.get<any[]>('/teams', { league: leagueId, season: this.season }) ?? [];
  }

  // ── Players ────────────────────────────────────────────────────────────────

  async getPlayers(leagueId: number, page = 1) {
    return this.get<any[]>('/players', { league: leagueId, season: this.season, page }) ?? [];
  }

  // ── Fixtures ───────────────────────────────────────────────────────────────

  async getLiveFixtures() {
    return this.get<any[]>('/fixtures', { live: 'all' }) ?? [];
  }

  async getFixturesByDate(leagueId: number, date: string) {
    return this.get<any[]>('/fixtures', { league: leagueId, season: this.season, date }) ?? [];
  }

  async getFixturesByRange(leagueId: number, from: string, to: string) {
    return (
      this.get<any[]>('/fixtures', { league: leagueId, season: this.season, from, to }) ?? []
    );
  }

  // ── Standings ──────────────────────────────────────────────────────────────

  async getStandings(leagueId: number) {
    const res = await this.get<any[]>('/standings', { league: leagueId, season: this.season });
    return res?.[0]?.league?.standings?.[0] ?? [];
  }

  // ── Transfers ──────────────────────────────────────────────────────────────

  async getTransfers(teamId: number) {
    return this.get<any[]>('/transfers', { team: teamId }) ?? [];
  }

  get currentSeason() {
    return this.season;
  }
}
