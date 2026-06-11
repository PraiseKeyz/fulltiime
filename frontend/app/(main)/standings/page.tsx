'use client'

import { useState } from 'react'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import { useLeagueStandings } from '@/lib/api/hooks/standings.hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { LeagueSelector } from './_components/league-selector'
import { StandingsTable } from './_components/standings-table'

export default function StandingsPage() {
  const { data: leagues } = useLeagues()
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('')

  const activeLeagueId = selectedLeagueId || leagues?.[0]?.id || ''
  const { data: standingsData, isLoading } = useLeagueStandings(activeLeagueId)

  return (
    <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8">
      <h1 className="text-2xl font-black mb-6">Standings</h1>

      {leagues && leagues.length > 0 && (
        <LeagueSelector leagues={leagues} activeLeagueId={activeLeagueId} onSelect={setSelectedLeagueId} />
      )}

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : !standingsData ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">Select a league to view standings.</p>
        </div>
      ) : (
        <StandingsTable standings={standingsData.standings} />
      )}
    </div>
  )
}
