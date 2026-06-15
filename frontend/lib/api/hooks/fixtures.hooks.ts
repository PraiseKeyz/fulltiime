import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../instance'
import type { Match, MatchStatus, FeaturedMatchResponse, Bracket, MatchPreview, H2HResponse, MatchNarrative, ChatMessage, ChatReply, MatchForm, CommentaryLine } from '../domain'

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
    // Keep a live page fresh on its own. Poll fast while in play; poll slower
    // around kick-off so a page opened just before the whistle still catches the
    // SCHEDULED → LIVE flip (the DB is refreshed by a 1-min cron). Finished games
    // and fixtures days away don't poll at all.
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data || 'preview' in data) return false

      if (data.status === 'LIVE' || data.status === 'HALFTIME') return 30_000

      if (data.status === 'SCHEDULED') {
        const kickoff = new Date(data.kickoff_at).getTime()
        const now = Date.now()
        const nearKickoff = now >= kickoff - 10 * 60_000 && now <= kickoff + 150 * 60_000
        if (nearKickoff) return 60_000
      }

      return false
    },
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
    refetchInterval: 60_000,
  })
}

export function useMatchForm(matchId: string) {
  return useQuery({
    queryKey: ['fixtures', 'form', matchId],
    queryFn:  () => api.get<MatchForm | null>(`/fixtures/${matchId}/form`, { silent: true }),
    enabled:  !!matchId,
    staleTime: 60 * 60_000,
    retry:    false,
  })
}

// Commentary is stored server-side; poll while the match is live, otherwise it's
// static (a finished game's feed never changes).
export function useMatchCommentary(matchId: string, live: boolean) {
  return useQuery({
    queryKey: ['fixtures', 'commentary', matchId],
    queryFn:  () => api.get<CommentaryLine[]>(`/fixtures/${matchId}/commentary`, { silent: true }),
    enabled:  !!matchId,
    refetchInterval: live ? 20_000 : false,
  })
}

export function useHeadToHead(matchId: string) {
  return useQuery({
    queryKey: ['fixtures', 'h2h', matchId],
    queryFn:  () => api.get<H2HResponse | null>(`/fixtures/${matchId}/h2h`, { silent: true }),
    enabled:  !!matchId,
    staleTime: 30 * 60_000,
    retry:    false,
  })
}

export function useMatchNarrative(matchId: string) {
  return useQuery({
    queryKey: ['fixtures', 'narrative', matchId],
    queryFn:  () => api.get<MatchNarrative | null>(`/fixtures/${matchId}/narrative`, { silent: true }),
    enabled:  !!matchId,
    staleTime: Infinity, // generate-once-lock-in — this never changes once written
    retry:    false,
  })
}

export function useMatchChat(matchId: string) {
  return useMutation({
    mutationFn: (messages: ChatMessage[]) =>
      api.post<ChatReply | null>(`/fixtures/${matchId}/chat`, { messages }, { silent: true }),
  })
}

export function useFeaturedMatch() {
  return useQuery({
    queryKey: ['fixtures', 'featured'],
    queryFn: () => api.get<FeaturedMatchResponse>('/fixtures/featured'),
    refetchInterval: 60_000,
  })
}
