import type { Match } from '@/lib/api/domain'

export type Filter = 'ALL' | 'LIVE' | 'UPCOMING' | 'FINISHED'

export interface LeagueGroup {
  leagueId:   string
  leagueName: string
  leagueLogo: string | null
  matches:    Match[]
}

export const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',      value: 'ALL'      },
  { label: 'Live',     value: 'LIVE'     },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Finished', value: 'FINISHED' },
]
