import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'
import type { Match, MatchStatus } from '../domain'

export const fixtureKeys = {
  all: ['fixtures'] as const,
  list: (filters: object) => ['fixtures', 'list', filters] as const,
  today: ['fixtures', 'today'] as const,
  live: ['fixtures', 'live'] as const,
  detail: (id: string) => ['fixtures', 'detail', id] as const,
}

export function useFixtures(filters: {
  status?: MatchStatus
  leagueId?: string
  teamId?: string
  date?: string
} = {}) {
  return useQuery({
    queryKey: fixtureKeys.list(filters),
    queryFn: () =>
      api.get<Match[]>('/fixtures', {
        params: Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined),
        ) as Record<string, string>,
      }),
  })
}

export function useTodayFixtures() {
  return useQuery({
    queryKey: fixtureKeys.today,
    queryFn: () => api.get<Match[]>('/fixtures/today'),
    refetchInterval: 60_000,
  })
}

export function useLiveFixtures() {
  return useQuery({
    queryKey: fixtureKeys.live,
    queryFn: () => api.get<Match[]>('/fixtures/live'),
    refetchInterval: 30_000,
  })
}

export function useFixture(id: string) {
  return useQuery({
    queryKey: fixtureKeys.detail(id),
    queryFn: () => api.get<Match>(`/fixtures/${id}`),
    enabled: !!id,
  })
}
