import type { League } from '@/lib/api/domain'

export function isCupType(league: League, tableIds: Set<string>) {
  if (league.sub_type) return league.sub_type.toLowerCase() !== 'domestic'
  return !tableIds.has(league.id)
}
