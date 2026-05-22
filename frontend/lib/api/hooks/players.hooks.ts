import { useQuery } from '@tanstack/react-query'
import { api } from '../instance'
import type { Player, PlayerPosition } from '../domain'

export const playerKeys = {
  all: ['players'] as const,
  list: (filters: object) => ['players', 'list', filters] as const,
  detail: (id: string) => ['players', 'detail', id] as const,
}

export function usePlayers(filters: {
  teamId?: string
  search?: string
  position?: PlayerPosition
} = {}) {
  return useQuery({
    queryKey: playerKeys.list(filters),
    queryFn: () =>
      api.get<Player[]>('/players', {
        params: Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== undefined),
        ) as Record<string, string>,
      }),
  })
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: playerKeys.detail(id),
    queryFn: () => api.get<Player>(`/players/${id}`),
    enabled: !!id,
  })
}
