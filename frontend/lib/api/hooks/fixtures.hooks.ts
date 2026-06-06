import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'
import type { Match, MatchStatus, FeaturedMatchResponse, Bracket, MatchPreview } from '../domain'

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
    queryFn: () => api.get<Match | MatchPreview>(`/fixtures/${id}`),
    enabled: !!id,
  })
}

export function useUpcomingFixtures(leagueId?: string, limit = 10) {
  return useQuery({
    queryKey: ['fixtures', 'upcoming', leagueId, limit],
    queryFn: () =>
      api.get<Match[]>('/fixtures/upcoming', {
        params: {
          ...(leagueId ? { leagueId } : {}),
          limit,
        },
      }),
    staleTime: 5 * 60_000,
  })
}

export function useBracket(leagueId: string) {
  return useQuery({
    queryKey: ['fixtures', 'bracket', leagueId],
    queryFn:  () => api.get<Bracket | null>(`/fixtures/bracket/${leagueId}`, { silent: true }),
    enabled:  !!leagueId,
    retry:    false,
  })
}

export function useFeaturedMatch() {
  return useQuery({
    queryKey: ['fixtures', 'featured'],
    queryFn: () => api.get<FeaturedMatchResponse>('/fixtures/featured'),
    refetchInterval: 60_000,
  })
}
