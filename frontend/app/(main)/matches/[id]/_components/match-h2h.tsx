'use client'

import { Shield, Swords } from 'lucide-react'
import { cn, formatMatchDate } from '@/lib/utils'
import type { Match, H2HFixture } from '@/lib/api/domain'
import { useHeadToHead } from '@/lib/api/hooks/fixtures.hooks'
import { EmptyTab } from './match-tab-content'

// ─── Head-to-head ────────────────────────────────────────────────────────────
//
// Past meetings between these two clubs, tallied from THIS fixture's home/away
// perspective so the summary bar reads naturally regardless of who hosted each
// historical leg. Lives in its own file (like match-rail) because it owns its
// data fetch and a meaningfully separate UI.

function SummaryBar({ match, played, homeWins, draws, awayWins }: {
  match: Match
  played: number; homeWins: number; draws: number; awayWins: number
}) {
  const total = played || 1
  const homeW = Math.round((homeWins / total) * 100)
  const drawW = Math.round((draws / total) * 100)
  const awayW = 100 - homeW - drawW

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between text-[12px] font-bold">
        <span className="flex items-center gap-1.5 truncate">
          {match.home_team.logo_url
            ? <img src={match.home_team.logo_url} alt="" className="h-4 w-4 object-contain" />
            : <Shield className="h-4 w-4 text-muted-foreground/30" />}
          {match.home_team.short_name ?? match.home_team.name}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {played} {played === 1 ? 'meeting' : 'meetings'}
        </span>
        <span className="flex items-center gap-1.5 truncate flex-row-reverse">
          {match.away_team.logo_url
            ? <img src={match.away_team.logo_url} alt="" className="h-4 w-4 object-contain" />
            : <Shield className="h-4 w-4 text-muted-foreground/30" />}
          {match.away_team.short_name ?? match.away_team.name}
        </span>
      </div>

      <div className="flex justify-between text-[13px] font-black tabular-nums">
        <span>{homeWins}</span>
        <span className="text-muted-foreground/60 text-[11px] font-bold uppercase tracking-wide self-end">
          {draws} draw{draws === 1 ? '' : 's'}
        </span>
        <span>{awayWins}</span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="rounded-l-full overflow-hidden bg-border" style={{ width: `${homeW}%` }}>
          <div className="h-full bg-primary rounded-l-full" />
        </div>
        <div className="overflow-hidden bg-border" style={{ width: `${drawW}%` }}>
          <div className="h-full bg-muted-foreground/40" />
        </div>
        <div className="rounded-r-full overflow-hidden bg-border" style={{ width: `${awayW}%` }}>
          <div className="h-full bg-muted-foreground/60 rounded-r-full ml-auto" />
        </div>
      </div>
    </div>
  )
}

function MeetingRow({ m }: { m: H2HFixture }) {
  const hasScore = m.homeScore != null && m.awayScore != null
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-20 shrink-0 text-[10px] text-muted-foreground leading-tight">
        {m.date && <div>{formatMatchDate(m.date)}</div>}
        {m.league?.name && <div className="truncate text-muted-foreground/70">{m.league.name}</div>}
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
        <span className="text-[12px] font-semibold truncate">{m.homeTeam.name}</span>
        {m.homeTeam.logo
          ? <img src={m.homeTeam.logo} alt="" className="h-4 w-4 object-contain shrink-0" />
          : <Shield className="h-4 w-4 text-muted-foreground/30 shrink-0" />}
      </div>
      <div className="shrink-0 text-[12px] font-black tabular-nums px-2">
        {hasScore ? `${m.homeScore} – ${m.awayScore}` : 'vs'}
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {m.awayTeam.logo
          ? <img src={m.awayTeam.logo} alt="" className="h-4 w-4 object-contain shrink-0" />
          : <Shield className="h-4 w-4 text-muted-foreground/30 shrink-0" />}
        <span className="text-[12px] font-semibold truncate">{m.awayTeam.name}</span>
      </div>
    </div>
  )
}

export function H2HTab({ match }: { match: Match }) {
  const { data, isLoading } = useHeadToHead(match.id)

  if (isLoading) {
    return <div className="h-48 rounded-xl bg-card border border-border animate-pulse" />
  }

  if (!data || data.meetings.length === 0) {
    return (
      <EmptyTab text={`${match.home_team.short_name ?? match.home_team.name} and ${match.away_team.short_name ?? match.away_team.name} haven't met recently.`} />
    )
  }

  const { meetings, summary } = data

  return (
    <div className="space-y-4">
      <SummaryBar match={match} {...summary} />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Swords className="h-4 w-4 text-muted-foreground" />
          <p className={cn('text-[11px] font-black uppercase tracking-widest text-muted-foreground')}>
            Previous meetings
          </p>
        </div>
        <div className="divide-y divide-border">
          {meetings.map(m => <MeetingRow key={m.id} m={m} />)}
        </div>
      </div>
    </div>
  )
}
