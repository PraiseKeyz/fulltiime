import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'
import type { League, Season } from '../domain'

export const leagueKeys = {
  all: ['leagues'] as const,
  list: ['leagues', 'list'] as const,
  detail: (id: string) => ['leagues', 'detail', id] as const,
  currentSeason: (id: string) => ['leagues', id, 'current-season'] as const,
}

export function useLeagues() {
  return useQuery({
    queryKey: leagueKeys.list,
    queryFn: () => api.get<League[]>('/leagues'),
  })
}

export function useLeague(id: string) {
  return useQuery({
    queryKey: leagueKeys.detail(id),
    queryFn: () => api.get<League>(`/leagues/${id}`),
    enabled: !!id,
  })
}

export function useCurrentSeason(leagueId: string) {
  return useQuery({
    queryKey: leagueKeys.currentSeason(leagueId),
    queryFn: () => api.get<Season>(`/leagues/${leagueId}/current-season`),
    enabled: !!leagueId,
  })
}
