'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import { useStandingsSnapshot } from '@/lib/api/hooks/standings.hooks'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import type { League, SnapshotEntry } from '@/lib/api/domain'

const TAB_OPTIONS = [
  { label: 'Leagues', value: 'LEAGUES' as const },
  { label: 'Cups & Tournaments', value: 'CUPS' as const },
]

type LeagueTab = (typeof TAB_OPTIONS)[number]['value']

function LeagueTableCard({ entry }: { entry: SnapshotEntry }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <Link
        href={`/leagues/${entry.league.id}`}
        className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        {entry.league.logo_url ? (
          <img src={entry.league.logo_url} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <Trophy className="h-4 w-4 text-primary" />
        )}
        <span className="text-[13px] font-black uppercase tracking-tight truncate">{entry.league.name}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
      </Link>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2 text-left w-6">#</th>
            <th className="px-2 py-2 text-left">Team</th>
            <th className="px-2 py-2 text-center w-8">P</th>
            <th className="px-4 py-2 text-center w-8">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entry.standings.map((row, idx) => (
            <tr key={row.id} className="hover:bg-muted/30 transition-colors">
              <td className={`px-4 py-2.5 tabular-nums ${idx === 0 ? 'text-primary font-black' : 'text-muted-foreground'}`}>
                {row.position}
              </td>
              <td className="px-2 py-2.5">
                <Link href={`/teams/${row.team.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  {row.team.logo_url && <img src={row.team.logo_url} alt="" className="h-5 w-5 object-contain shrink-0" />}
                  <span className="font-medium truncate">{row.team.short_name ?? row.team.name}</span>
                </Link>
              </td>
              <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{row.played}</td>
              <td className="px-4 py-2.5 text-center tabular-nums font-black">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link
        href={`/leagues/${entry.league.id}`}
        className="mt-auto flex items-center justify-center gap-1 py-2.5 text-[11px] font-bold text-primary hover:underline border-t border-border"
      >
        Full Table <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function CompetitionCard({ league }: { league: League }) {
  return (
    <Link
      href={`/leagues/${league.id}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
    >
      <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {league.logo_url
          ? <img src={league.logo_url} alt="" className="h-7 w-7 object-contain" />
          : <Trophy className="h-5 w-5 text-muted-foreground" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">
          {league.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{league.country?.name ?? 'International'}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-11 bg-muted border-b border-border" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-5 w-5 rounded-full bg-muted" />
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="h-4 w-8 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function isCupType(league: League, tableIds: Set<string>) {
  if (league.sub_type) return league.sub_type.toLowerCase() !== 'domestic'
  return !tableIds.has(league.id)
}

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
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
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
