'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import { useLiveFixtures } from '@/lib/api/hooks/fixtures.hooks'
import type { League } from '@/lib/api/domain'

function LeagueRow({ league, live }: { league: League; live: boolean }) {
  return (
    <Link
      href={`/leagues/${league.id}`}
      className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors"
    >
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        {league.logo_url
          ? <img src={league.logo_url} alt="" className="h-5 w-5 object-contain" />
          : <Trophy className="h-4 w-4 text-muted-foreground" />
        }
        {live && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-live ring-2 ring-card animate-pulse" />}
      </span>
      <span className="truncate text-[12px] font-bold" title={league.name}>{league.name}</span>
      {live && (
        <span className="ml-auto shrink-0 text-[9px] font-black uppercase tracking-wide text-live">Live</span>
      )}
    </Link>
  )
}

function PanelSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-10 border-b border-border bg-muted/40 shrink-0" />
      <div className="flex-1 space-y-3 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-muted" />
            <div className="h-3 flex-1 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LeaguesPanel() {
  const { data: leagues, isLoading } = useLeagues()
  const { data: live } = useLiveFixtures()

  const liveLeagueIds = useMemo(
    () => new Set((live ?? []).map(m => m.season?.league?.id).filter((id): id is string => !!id)),
    [live],
  )

  // Live leagues float to the top, otherwise keep the priority order from the API.
  const sorted = useMemo(() => {
    if (!leagues) return []
    return [...leagues].sort((a, b) => {
      const liveA = liveLeagueIds.has(a.id) ? 0 : 1
      const liveB = liveLeagueIds.has(b.id) ? 0 : 1
      return liveA - liveB
    })
  }, [leagues, liveLeagueIds])

  if (isLoading) return <PanelSkeleton />
  if (!sorted.length) return null

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden">
      <div className="shrink-0 border-b border-border px-3 py-2.5">
        <h3 className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">Leagues</h3>
      </div>
      <div className="max-h-[280px] flex-1 divide-y divide-border/60 overflow-y-auto scrollbar-none lg:max-h-none">
        {sorted.map(l => (
          <LeagueRow key={l.id} league={l} live={liveLeagueIds.has(l.id)} />
        ))}
      </div>
    </div>
  )
}
