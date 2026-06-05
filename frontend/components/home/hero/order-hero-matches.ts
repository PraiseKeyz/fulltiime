import type { Match, League } from '@/lib/api/domain'

// Optional personalization — passed in for authenticated users so their
// club/league matches float to the top. Anonymous users pass nothing.
export interface HeroFavorites {
  teamIds:   string[]
  leagueIds: string[]
}

// Lower bucket = shown first. Live always wins, regardless of favorites.
const STATUS_BUCKET: Record<string, number> = {
  LIVE:      0,
  HALFTIME:  0,
  SCHEDULED: 1,
  FINISHED:  2,
  POSTPONED: 3,
  CANCELLED: 3,
}

/**
 * Orders matches for the hero selector.
 *
 * Priority:
 *   1. Status   — live/halftime first, then upcoming, then finished
 *   2. Favorite — within the same status tier, a favorite club/league floats up
 *   3. Hotness  — league rank, derived from the order of the (already
 *                 priority-sorted) `leagues` array — single source of truth
 *   4. Tie-break — live: more goals then later minute; else: earliest kickoff
 *
 * `leagues` must be the priority-ordered list returned by GET /leagues.
 */
export function orderHeroMatches(
  matches: Match[],
  leagues: League[],
  favorites?: HeroFavorites,
): Match[] {
  const rank = new Map<string, number>()
  leagues.forEach((l, i) => rank.set(l.id, i))
  const leagueRank = (m: Match) => rank.get(m.season?.league?.id ?? '') ?? Number.MAX_SAFE_INTEGER

  const isFavorite = (m: Match) => {
    if (!favorites) return false
    const leagueId = m.season?.league?.id
    return (
      favorites.teamIds.includes(m.home_team.id) ||
      favorites.teamIds.includes(m.away_team.id) ||
      (leagueId ? favorites.leagueIds.includes(leagueId) : false)
    )
  }

  return [...matches].sort((a, b) => {
    // 1. status bucket — live always first
    const sb = (STATUS_BUCKET[a.status] ?? 9) - (STATUS_BUCKET[b.status] ?? 9)
    if (sb !== 0) return sb

    // 2. favorites boost, only within the same status tier
    const fav = Number(isFavorite(b)) - Number(isFavorite(a))
    if (fav !== 0) return fav

    // 3. league hotness rank
    const lr = leagueRank(a) - leagueRank(b)
    if (lr !== 0) return lr

    // 4. tie-breaker
    if (a.status === 'LIVE' || a.status === 'HALFTIME') {
      const goals = ((b.home_score ?? 0) + (b.away_score ?? 0)) -
                    ((a.home_score ?? 0) + (a.away_score ?? 0))
      if (goals !== 0) return goals
      return (b.minute ?? 0) - (a.minute ?? 0)
    }
    return new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime()
  })
}

// Latest goal event for the scorer line ("Füllkrug 26'"), if present.
export function latestGoal(match: Match) {
  const goals = (match.events ?? []).filter(e => e.type.toLowerCase().includes('goal'))
  return goals.length ? goals[goals.length - 1] : null
}
