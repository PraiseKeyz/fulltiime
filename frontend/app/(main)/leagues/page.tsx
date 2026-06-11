'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useStandingsSnapshot } from '@/lib/api/hooks/standings.hooks'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import { Button } from '@/components/ui/button'
import { LeagueTableCard } from './_components/league-table-card'
import { CompetitionCard } from './_components/competition-card'
import { SkeletonCard } from './_components/skeleton-card'
import { TAB_OPTIONS, type LeagueTab } from './_components/types'
import { isCupType } from './_components/utils'

export default function LeaguesPage() {
  const [activeTab, setActiveTab] = useState<LeagueTab>('LEAGUES')
  const { data: snapshot, isLoading } = useStandingsSnapshot()
  const { data: leagues } = useLeagues()

  const tableIds = useMemo(() => new Set((snapshot ?? []).map(entry => entry.league.id)), [snapshot])

  const cupCompetitions = useMemo(() => {
    return (leagues ?? []).filter(league => isCupType(league, tableIds))
  }, [leagues, tableIds])

  return (
    <>
      <div className="bg-card border-b border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black uppercase tracking-wide">Competitions</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6 space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Switch between league tables and cup / tournament hubs.</p>
          </div>

          <div className="flex gap-2 rounded-full border border-border bg-muted/50 p-1">
            {TAB_OPTIONS.map(tab => (
              <Button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                variant="ghost"
                size="sm"
                className={`rounded-full px-4 text-sm ${
                  activeTab === tab.value
                    ? 'bg-card text-foreground shadow-sm hover:bg-card'
                    : 'text-muted-foreground hover:bg-white/10'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : activeTab === 'LEAGUES' ? (
          (snapshot?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {snapshot!.map(entry => <LeagueTableCard key={entry.league.id} entry={entry} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-16 text-center">
              <p className="text-muted-foreground text-sm">No league tables available yet.</p>
              <Link href="/matches" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
                Browse fixtures instead
              </Link>
            </div>
          )
        ) : cupCompetitions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cupCompetitions.map(league => <CompetitionCard key={league.id} league={league} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-16 text-center">
            <p className="text-muted-foreground text-sm">No cup or tournament hubs available yet.</p>
            <Link href="/matches" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
              Browse fixtures instead
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
