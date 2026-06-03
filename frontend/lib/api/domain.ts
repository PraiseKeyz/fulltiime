// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: 'USER' | 'ADMIN'
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

// ─── League ───────────────────────────────────────────────────────────────────

export interface Country {
  id: string
  name: string
  code: string
  flag_url: string | null
}

export interface League {
  id: string
  name: string
  short_name: string | null
  logo_url: string | null
  country: Country | null
  is_active: boolean
}

export interface Season {
  id: string
  league_id: string
  league?: League
  year: number
  start_date: string
  end_date: string
  is_current: boolean
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamSummary {
  id: string
  name: string
  short_name: string | null
  logo_url: string | null
}

export interface Team extends TeamSummary {
  code: string | null
  country: Country | null
  founded: number | null
  stadium: string | null
  venue_city: string | null
  is_active: boolean
}

// ─── Player ───────────────────────────────────────────────────────────────────

export type PlayerPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD'

export interface Player {
  id: string
  name: string
  first_name: string | null
  last_name: string | null
  photo_url: string | null
  nationality: string | null
  country: Country | null
  date_of_birth: string | null
  position: PlayerPosition | null
  number: number | null
  team: TeamSummary | null
  is_active: boolean
}

// ─── Match / Fixture ──────────────────────────────────────────────────────────

export type MatchStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'HALFTIME'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'

export interface MatchEvent {
  id: string
  type: string
  minute: number
  team_id: string | null
  player_name: string | null
  detail: string | null
}

export interface Match {
  id: string
  season: Season & { league: Pick<League, 'id' | 'name' | 'logo_url'> }
  home_team: TeamSummary
  away_team: TeamSummary
  kickoff_at: string
  status: MatchStatus
  minute: number | null
  home_score: number | null
  away_score: number | null
  home_ht_score: number | null
  away_ht_score: number | null
  venue: string | null
  referee: string | null
  events?: MatchEvent[]
  statistics?: MatchStatistic[]
}

export interface FeaturedMatchResponse {
  match: Match
  type: 'live' | 'upcoming' | 'finished'
}

// ─── Match Statistic ─────────────────────────────────────────────────────────

export interface MatchStatistic {
  team_id:         string
  possession:      number | null
  shots:           number | null
  shots_on_target: number | null
  xg:              number | null
  corners:         number | null
  fouls:           number | null
  yellow_cards:    number | null
  red_cards:       number | null
}

// ─── Standing ─────────────────────────────────────────────────────────────────

export interface Standing {
  id: string
  position: number
  team: TeamSummary
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_diff: number
  points: number
  form: string | null
}

export interface StandingsResponse {
  season: Season
  standings: Standing[]
}

// ─── Standings Snapshot ───────────────────────────────────────────────────────

export interface SnapshotEntry {
  league:    Pick<League, 'id' | 'name' | 'logo_url' | 'short_name'>
  standings: Standing[]
}

// ─── News ─────────────────────────────────────────────────────────────────────

export type ArticleCategory =
  | 'NEWS'
  | 'ANALYSIS'
  | 'INTERVIEW'
  | 'TRANSFER'
  | 'MATCH_REPORT'

export interface ArticleAuthor {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_url: string | null
  category: ArticleCategory
  is_published: boolean
  published_at: string | null
  author: ArticleAuthor
  tags: string[]
  created_at: string
  updated_at: string
}

export interface PaginatedArticles {
  articles: Article[]
  total: number
  page: number
  limit: number
  pages: number
}
