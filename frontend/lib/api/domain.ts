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

// Tokens are delivered as httpOnly cookies, never in the response body
export interface AuthResponse {
  user: User
}

// ─── League ───────────────────────────────────────────────────────────────────

export interface Country {
  id: string
  name: string
  code: string
  flag_url: string | null
}

export type LeagueSubType = 'domestic' | 'cup_international' | 'international' | 'play-offs' | string

export interface League {
  id: string
  name: string
  short_name: string | null
  logo_url: string | null
  country: Country | null
  sub_type?: LeagueSubType | null
  is_active: boolean
  seasons?: Season[]
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
  players?: Player[]
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
  extra_minute: number | null
  team_id: string | null
  player_name: string | null
  related_player_name: string | null
  detail: string | null
  sort_order: number | null
}

export interface MatchLineup {
  id: string
  team_id: string
  player_name: string
  player_photo: string | null
  jersey_number: number | null
  position: string | null
  formation_field: string | null
  is_starting: boolean
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
  home_formation: string | null
  away_formation: string | null
  events?: MatchEvent[]
  lineups?: MatchLineup[]
  statistics?: MatchStatistic[]
}

export interface FeaturedMatchResponse {
  match: Match
  type: 'live' | 'upcoming' | 'finished'
}

// ─── Match Preview (placeholder fixtures) ──────────────────────────────────────

export interface VenueInfo {
  name:     string | null
  city?:    string | null
  capacity?: number | null
  surface?: string | null
  image?:   string | null
}

export interface MatchPreview {
  preview:  true
  id:       number
  name:     string | null
  date:     string | null
  venue:    VenueInfo | null
  league:   { name: string; logo: string | null } | null
  stage:    string | null
  homeSlot: string | null
  awaySlot: string | null
  homeTeam: BracketTeam | null
  awayTeam: BracketTeam | null
  roundFixtures?: BracketTie[]
}

// ─── Knockout Bracket ──────────────────────────────────────────────────────────

export interface BracketTeam {
  name: string
  logo: string | null
}

export interface BracketTie {
  id:          number
  label:       string | null   // "Match 73"
  date:        string | null
  placeholder: boolean
  homeSlot:    string | null   // "1st Group E" (before teams are known)
  awaySlot:    string | null
  homeTeam:    BracketTeam | null
  awayTeam:    BracketTeam | null
}

export interface BracketStage {
  id:   number
  name: string
  ties: BracketTie[]
}

export interface BracketEdge {
  child:     number
  childSlot: 'home' | 'away'
  parent:    number
  outcome:   'winner' | 'loser'
}

export interface Bracket {
  stages: BracketStage[]
  edges:  BracketEdge[]
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
  group: string | null
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
