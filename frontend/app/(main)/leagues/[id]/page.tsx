'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api/instance'
import { useLeague } from '@/lib/api/hooks/leagues.hooks'
import { useUpcomingFixtures, useBracket } from '@/lib/api/hooks/fixtures.hooks'
import type { Match, Standing, StandingsResponse } from '@/lib/api/domain'
import { KnockoutBracket } from './_components/knockout-bracket'
import { LeagueBanner } from './_components/league-banner'
import { LeagueTabs } from './_components/league-tabs'
import { StandingsTable } from './_components/standings-table'
import { FixtureList } from './_components/fixture-list'
import type { Tab } from './_components/types'

export default function CompetitionHubPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const urlTab = searchParams.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(urlTab ?? 'table')

  // Selecting a tab also writes it to the URL (?tab=…) so a reload restores it
  const selectTab = useCallback((value: Tab) => {
    setTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  const { data: league, isLoading: leagueLoading } = useLeague(id)
  const { data: bracket } = useBracket(id)
  const hasBracket = (bracket?.stages?.length ?? 0) > 0

  // Standings — silent so cup competitions (no table) don't fire an error toast
  const { data: standingsData, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings', 'league', id, 'hub'],
    queryFn:  () => api.get<StandingsResponse>(`/standings/league/${id}`, { silent: true }),
    enabled:  !!id,
    retry:    false,
    refetchInterval: 60_000,
  })

  const { data: upcoming }  = useUpcomingFixtures(id, 10)

  const { data: finished } = useQuery({
    queryKey: ['fixtures', 'league', id, 'finished'],
    queryFn:  () => api.get<Match[]>('/fixtures', { params: { leagueId: id, status: 'FINISHED' } }),
    enabled:  !!id,
  })

  const recent = useMemo(
    () => [...(finished ?? [])].sort((a, b) =>
      new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime()
    ).slice(0, 10),
    [finished],
  )

  const hasStandings = (standingsData?.standings?.length ?? 0) > 0

  // Group-structured competitions (World Cup) → split into per-group tables
  const groups = useMemo(() => {
    const rows = standingsData?.standings ?? []
    if (!rows.some(r => r.group)) return null
    const map = new Map<string, Standing[]>()
    for (const r of rows) {
      const g = r.group ?? 'Group'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(r)
    }
    return Array.from(map.entries())
      .map(([name, rows]) => ({ name, rows: rows.sort((a, b) => a.position - b.position) }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [standingsData])

  const tableLabel = groups ? 'Groups' : 'Table'

  // Default to Fixtures for competitions without a league table (cups) —
  // but only when the URL didn't already specify a tab.
  useEffect(() => {
    if (!urlTab && !standingsLoading && !hasStandings) setTab('fixtures')
  }, [urlTab, standingsLoading, hasStandings])

  if (leagueLoading) {
    return (
      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-8 space-y-4">
        <div className="h-40 rounded-xl bg-card border border-border animate-pulse" />
        <div className="h-96 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    )
  }

  if (!league) {
    return (
      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">League not found.</p>
        <Link href="/leagues" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          Back to leagues
        </Link>
      </div>
    )
  }

  const currentSeason = league.seasons?.find(s => s.is_current) ?? league.seasons?.[0]

  return (
    <>
      <LeagueBanner league={league} currentSeason={currentSeason} />

      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-6">
        <LeagueTabs
          tab={tab}
          onSelect={selectTab}
          hasStandings={hasStandings}
          hasBracket={hasBracket}
          tableLabel={tableLabel}
        />

        {tab === 'knockout' && hasBracket && bracket && (
          <KnockoutBracket bracket={bracket} />
        )}

        {tab === 'table' && hasStandings && standingsData && (
          groups ? (
            <div className="grid lg:grid-cols-2 gap-5">
              {groups.map(g => (
                <div key={g.name}>
                  <h3 className="text-[12px] font-black uppercase tracking-wide text-muted-foreground mb-2 px-1">{g.name}</h3>
                  <StandingsTable standings={g.rows} />
                </div>
              ))}
            </div>
          ) : (
            <StandingsTable standings={standingsData.standings} />
          )
        )}

        {tab === 'fixtures' && (
          <div className="space-y-5">
            <FixtureList title="Upcoming" matches={upcoming ?? []} />
            <FixtureList title="Recent Results" matches={recent} />
            {(upcoming?.length ?? 0) === 0 && recent.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-[13px] text-muted-foreground">No fixtures available for this competition yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
