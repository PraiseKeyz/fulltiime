import type { MatchView } from './phase'
import type { VenueInfo } from '@/lib/api/domain'
import { shortSlot } from './labels'

// ─── Normalized view metadata ────────────────────────────────────────────────
//
// A Match and a MatchPreview carry the same conceptual fields under different
// shapes (e.g. `home_team.name` vs a `homeSlot` placeholder). getViewMeta flattens
// both into ONE shape so the hero and narrative don't each re-do the branching.

export interface ViewMeta {
  home:       string
  homeLogo:   string | null
  away:       string
  awayLogo:   string | null
  league:     string | null
  leagueLogo: string | null
  stage:      string | null
  date:       string | null
  venue:      VenueInfo | null
  venueName:  string | null
  referee:    string | null
  homeScore:  number | null
  awayScore:  number | null
}

export function getViewMeta(view: MatchView): ViewMeta {
  if (view.phase === 'tbd') {
    const p = view.preview
    return {
      home:       p.homeTeam?.name ?? shortSlot(p.homeSlot),
      homeLogo:   p.homeTeam?.logo ?? null,
      away:       p.awayTeam?.name ?? shortSlot(p.awaySlot),
      awayLogo:   p.awayTeam?.logo ?? null,
      league:     p.league?.name ?? null,
      leagueLogo: p.league?.logo ?? null,
      stage:      p.stage,
      date:       p.date,
      venue:      p.venue,
      venueName:  p.venue?.name ?? null,
      referee:    null,
      homeScore:  null,
      awayScore:  null,
    }
  }

  const m = view.match
  const venue: VenueInfo | null =
    m.venue_ref ?? (m.venue ? { name: m.venue } : null)

  return {
    home:       m.home_team.name,
    homeLogo:   m.home_team.logo_url,
    away:       m.away_team.name,
    awayLogo:   m.away_team.logo_url,
    league:     m.season?.league?.name ?? null,
    leagueLogo: m.season?.league?.logo_url ?? null,
    stage:      null,
    date:       m.kickoff_at,
    venue,
    venueName:  venue?.name ?? null,
    referee:    m.referee,
    homeScore:  m.home_score,
    awayScore:  m.away_score,
  }
}
