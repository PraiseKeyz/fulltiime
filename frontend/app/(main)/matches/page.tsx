'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/instance'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import type { Match } from '@/lib/api/domain'

import { MatchesHeader } from './_components/matches-header'
import { TopLeaguesRail } from './_components/top-leagues-rail'
import { StatusSection, SectionHeader, EmptyState, MatchListSkeleton } from './_components/status-section'
import { LeagueSection } from './_components/league-section'
import { getDateString, formatDateLabel, groupByLeague } from './_components/utils'
import type { Filter } from './_components/types'

export default function MatchesPage() {
  const [filter,           setFilter]           = useState<Filter>('ALL')
  const [dayOffset,        setDayOffset]        = useState(0)
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)

  const dateStr = getDateString(dayOffset)

  const { data: leagues } = useLeagues()

  const { data: matches, isLoading } = useQuery({
    queryKey:        ['fixtures', 'date', dateStr],
    queryFn:         () => api.get<Match[]>('/fixtures', { params: { date: dateStr } }),
    refetchInterval: (query) => {
      const hasLive = query.state.data?.some(m => m.status === 'LIVE' || m.status === 'HALFTIME')
      return hasLive ? 30_000 : 5 * 60_000
    },
  })

  // Per-league counts for the rail (from the full day's matches, unfiltered)
  const leagueCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const m of matches ?? []) {
      const id = m.season?.league?.id
      if (id) map.set(id, (map.get(id) ?? 0) + 1)
    }
    return map
  }, [matches])

  // Apply the selected-league filter before splitting by status
  const scoped = useMemo(() => {
    if (!selectedLeagueId) return matches ?? []
    return (matches ?? []).filter(m => m.season?.league?.id === selectedLeagueId)
  }, [matches, selectedLeagueId])

  const liveMatches     = useMemo(() => scoped.filter(m => m.status === 'LIVE' || m.status === 'HALFTIME'), [scoped])
  const upcomingMatches = useMemo(() => scoped.filter(m => m.status === 'SCHEDULED'), [scoped])
  const finishedMatches = useMemo(() => scoped.filter(m => m.status === 'FINISHED'), [scoped])

  const liveGroups     = useMemo(() => groupByLeague(liveMatches),     [liveMatches])
  const upcomingGroups = useMemo(() => groupByLeague(upcomingMatches), [upcomingMatches])
  const finishedGroups = useMemo(() => groupByLeague(finishedMatches), [finishedMatches])

  const showLive     = filter === 'ALL' || filter === 'LIVE'
  const showUpcoming = filter === 'ALL' || filter === 'UPCOMING'
  const showFinished = filter === 'ALL' || filter === 'FINISHED'

  const hasAnything =
    (showLive     && liveGroups.length > 0) ||
    (showUpcoming && upcomingGroups.length > 0) ||
    (showFinished && finishedGroups.length > 0)

  // When the selected scope has no matches for a current/future date, fall back
  // to upcoming fixtures. We fetch ALL upcoming once (stable key) and filter by
  // league client-side — so switching leagues never re-fetches or flashes a skeleton.
  const dateIsEmpty  = dayOffset >= 0 && !isLoading && scoped.length === 0
  const showFallback = dateIsEmpty && (filter === 'ALL' || filter === 'UPCOMING')

  const { data: comingUpAll, isLoading: comingUpLoading } = useQuery({
    queryKey:  ['fixtures', 'upcoming', 'all'],
    queryFn:   () => api.get<Match[]>('/fixtures/upcoming', { params: { limit: 50 } }),
    enabled:   showFallback,
    staleTime: 5 * 60_000,
  })

  const comingUpScoped = useMemo(() => {
    if (!selectedLeagueId) return comingUpAll ?? []
    return (comingUpAll ?? []).filter(m => m.season?.league?.id === selectedLeagueId)
  }, [comingUpAll, selectedLeagueId])

  const comingUpGroups = useMemo(() => groupByLeague(comingUpScoped), [comingUpScoped])
  const selectedLeagueName = leagues?.find(l => l.id === selectedLeagueId)?.name ?? ''
  const dayWord = dayOffset === 0 ? 'today' : dayOffset === 1 ? 'tomorrow' : `on ${formatDateLabel(dayOffset)}`

  return (
    <>
      <MatchesHeader
        liveCount={liveMatches.length}
        filter={filter}
        onFilterChange={setFilter}
        dayOffset={dayOffset}
        onDayChange={setDayOffset}
      />

      {/* Two-column body: Top Leagues rail + matches */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6 grid lg:grid-cols-[260px_1fr] gap-6">
        <TopLeaguesRail
          leagues={leagues ?? []}
          counts={leagueCounts}
          totalCount={matches?.length ?? 0}
          selectedId={selectedLeagueId}
          onSelect={setSelectedLeagueId}
        />

        <div className="space-y-8 min-w-0">
          {isLoading ? (
            <MatchListSkeleton />
          ) : !hasAnything ? (
            showFallback ? (
              <section>
                <p className="text-[13px] text-muted-foreground mb-4">
                  No {selectedLeagueId ? `${selectedLeagueName} ` : ''}matches {dayWord} — here&apos;s what&apos;s coming up next.
                </p>
                <SectionHeader label="Coming Up" color="#22c55e" count={comingUpScoped.length} />
                {comingUpLoading ? (
                  <MatchListSkeleton count={3} />
                ) : comingUpGroups.length > 0 ? (
                  <div className="space-y-3">
                    {comingUpGroups.map(g => <LeagueSection key={g.leagueId} group={g} />)}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </section>
            ) : (
              <EmptyState />
            )
          ) : (
            <>
              {showLive     && <StatusSection label="Live Now"  color="#ef4444" count={liveMatches.length}     groups={liveGroups} />}
              {showUpcoming  && <StatusSection label="Upcoming"  color="#22c55e" count={upcomingMatches.length} groups={upcomingGroups} />}
              {showFinished  && <StatusSection label="Finished"  color="#888888" count={finishedMatches.length} groups={finishedGroups} />}
            </>
          )}
        </div>
      </div>
    </>
  )
}
