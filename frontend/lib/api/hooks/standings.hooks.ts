import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'
import type { StandingsResponse, Standing, SnapshotEntry } from '../domain'

export function useStandingsSnapshot() {
  return useQuery({
    queryKey: ['standings', 'snapshot'],
    queryFn:  () => api.get<SnapshotEntry[]>('/standings/snapshot'),
    staleTime: 5 * 60_000,
  })
}

export const standingKeys = {
  league: (leagueId: string, season?: number) =>
    ['standings', 'league', leagueId, season] as const,
  team: (teamId: string) => ['standings', 'team', teamId] as const,
}

export function useLeagueStandings(leagueId: string, season?: number) {
  return useQuery({
    queryKey: standingKeys.league(leagueId, season),
    queryFn: () =>
      api.get<StandingsResponse>(`/standings/league/${leagueId}`, {
        params: season ? { season } : undefined,
      }),
    enabled: !!leagueId,
  })
}

export function useTeamStandings(teamId: string) {
  return useQuery({
    queryKey: standingKeys.team(teamId),
    queryFn: () => api.get<Standing[]>(`/standings/team/${teamId}`),
    enabled: !!teamId,
  })
}
