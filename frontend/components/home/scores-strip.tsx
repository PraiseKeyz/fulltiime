'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Placeholder match data — will be replaced with API data
const MOCK_MATCHES = [
  { id: '1', comp: 'UCL', status: 'LIVE', minute: 87, home: 'ARS', homeLogo: '', away: 'BAR', awayLogo: '', homeScore: 2, awayScore: 1, awayRed: true },
  { id: '2', comp: 'UCL', status: 'LIVE', minute: 23, home: 'MCI', homeLogo: '', away: 'RMA', awayLogo: '', homeScore: 0, awayScore: 0 },
  { id: '3', comp: 'UCL', status: 'HT', minute: null, home: 'LIV', homeLogo: '', away: 'PSG', awayLogo: '', homeScore: 3, awayScore: 2 },
  { id: '4', comp: 'BUN', status: 'LIVE', minute: 78, home: 'BAY', homeLogo: '', away: 'INT', awayLogo: '', homeScore: 1, awayScore: 1 },
  { id: '5', comp: 'PL', status: 'SCHEDULED', time: '19:45', home: 'CHE', homeLogo: '', away: 'TOT', awayLogo: '', homeScore: null, awayScore: null },
  { id: '6', comp: 'SA', status: 'FT', minute: null, home: 'JUV', homeLogo: '', away: 'ATM', awayLogo: '', homeScore: 2, awayScore: 0 },
  { id: '7', comp: 'UCL', status: 'LIVE', minute: 55, home: 'BVB', homeLogo: '', away: 'MIL', awayLogo: '', homeScore: 1, awayScore: 2 },
]

function StatusBadge({ status, minute, time }: { status: string; minute?: number | null; time?: string }) {
  if (status === 'LIVE' && minute) {
    return (
      <span className="flex items-center gap-1 text-live text-[10px] font-bold">
        <span className="h-1 w-1 rounded-full bg-live animate-pulse" />
        {minute}&apos;
      </span>
    )
  }
  if (status === 'HT') return <span className="text-[10px] font-bold text-orange-400">HT</span>
  if (status === 'FT') return <span className="text-[10px] font-semibold text-muted-foreground">FT</span>
  if (status === 'SCHEDULED' && time) return <span className="text-[11px] font-semibold text-foreground">{time}</span>
  return null
}

export function ScoresStrip() {
  return (
    <section className="bg-background-secondary border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-live" />
            Scores &amp; Fixtures
          </h2>
          <Link href="/matches" className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
            All Matches <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Scrollable cards */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {MOCK_MATCHES.map((match) => (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className="shrink-0 w-[140px] rounded-lg border border-border bg-card hover:border-primary/40 transition-colors p-3 space-y-2"
            >
              {/* Competition + status */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {match.comp}
                </span>
                <StatusBadge status={match.status} minute={match.minute} time={(match as any).time} />
              </div>

              {/* Home team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <span className="text-[12px] font-bold">{match.home}</span>
                </div>
                <span className="text-[13px] font-black tabular-nums">
                  {match.homeScore ?? '—'}
                </span>
              </div>

              {/* Away team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <span className="text-[12px] font-bold">{match.away}</span>
                  {(match as any).awayRed && <span className="text-live text-[10px]">●</span>}
                </div>
                <span className="text-[13px] font-black tabular-nums">
                  {match.awayScore ?? '—'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
