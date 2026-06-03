'use client'

import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import { useStandingsSnapshot } from '@/lib/api/hooks/standings.hooks'
import type { SnapshotEntry } from '@/lib/api/domain'

const DOMESTIC = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga']

function LeagueTable({ entry }: { entry: SnapshotEntry }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* League header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
        {entry.league.logo_url ? (
          <img src={entry.league.logo_url} alt={entry.league.name} className="h-5 w-5 object-contain" />
        ) : (
          <Trophy className="h-4 w-4 text-primary" />
        )}
        <span className="text-[13px] font-black uppercase tracking-tight">{entry.league.name}</span>
      </div>

      {/* Standings rows */}
      <div className="divide-y divide-border">
        {entry.standings.map((row, idx) => (
          <div
            key={row.id}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
          >
            <span className={`text-[12px] font-black w-4 shrink-0 ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              {row.position}
            </span>

            {row.team.logo_url ? (
              <img src={row.team.logo_url} alt={row.team.name} className="h-5 w-5 object-contain shrink-0" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted shrink-0" />
            )}

            <span className="text-[13px] font-semibold flex-1 truncate">
              {row.team.short_name ?? row.team.name}
            </span>

            <div className="flex items-center gap-4 text-[12px] tabular-nums shrink-0">
              <span className="text-muted-foreground w-6 text-center">{row.played}</span>
              <span className="font-bold w-6 text-center">{row.points}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <Link
        href={`/standings?league=${entry.league.id}`}
        className="flex items-center justify-center gap-1 py-2.5 text-[11px] font-bold text-primary hover:underline border-t border-border"
      >
        Full Table <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-11 bg-muted border-b border-border" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-5 w-5 rounded-full bg-muted" />
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="h-4 w-12 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function StandingsSnapshot() {
  const { data: snapshot, isLoading } = useStandingsSnapshot()

  const domestic = snapshot?.filter(e => DOMESTIC.includes(e.league.name)) ?? []

  if (!isLoading && domestic.length === 0) return null

  return (
    <section className="py-8 bg-background-secondary">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <Trophy className="h-5 w-5 text-primary" />
            Final Standings
          </h2>
          <Link href="/standings" className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            All Standings <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonTable key={i} />)
            : domestic.map(entry => <LeagueTable key={entry.league.id} entry={entry} />)
          }
        </div>
      </div>
    </section>
  )
}
