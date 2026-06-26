import type { Match } from '@/lib/api/domain'
import type { LeagueGroup } from './types'

export function formatDateLabel(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  if (offset === 0)  return 'Today'
  if (offset === -1) return 'Yesterday'
  if (offset === 1)  return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function groupByLeague(matches: Match[]): LeagueGroup[] {
  const map = new Map<string, LeagueGroup>()
  for (const match of matches) {
    const id   = match.season?.league?.id ?? 'unknown'
    const name = match.season?.league?.name ?? 'Unknown'
    const logo = match.season?.league?.logo_url ?? null
    if (!map.has(id)) map.set(id, { leagueId: id, leagueName: name, leagueLogo: logo, matches: [] })
    map.get(id)!.matches.push(match)
  }
  return Array.from(map.values())
}
