import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'
import type { Team, Match } from '../domain'

export const teamKeys = {
  all: ['teams'] as const,
  list: (filters: object) => ['teams', 'list', filters] as const,
  detail: (id: string) => ['teams', 'detail', id] as const,
  fixtures: (id: string) => ['teams', id, 'fixtures'] as const,
}

export function useTeams(filters: { countryId?: string; search?: string } = {}) {
  return useQuery({
    queryKey: teamKeys.list(filters),
    queryFn: () =>
      api.get<Team[]>('/teams', {
        params: Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined),
        ) as Record<string, string>,
      }),
  })
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => api.get<Team>(`/teams/${id}`),
    enabled: !!id,
  })
}

export function useTeamFixtures(id: string, limit = 10) {
  return useQuery({
    queryKey: teamKeys.fixtures(id),
    queryFn: () => api.get<Match[]>(`/teams/${id}/fixtures`, { params: { limit } }),
    enabled: !!id,
  })
}
