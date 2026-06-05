'use client'

import { useState } from 'react'
import {ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type MatchStatus = 'LIVE' | 'HT' | 'UPCOMING' | 'FINISHED'
type Filter = 'ALL' | 'LIVE' | 'UPCOMING' | 'FINISHED'

interface MatchRow {
  id: string
  comp: string
  compColor: string
  homeTeam: string
  homeLogo: string
  awayTeam: string
  awayLogo: string
  homeScore: number | null
  awayScore: number | null
  status: MatchStatus
  minute?: number
  kickoff?: string
  soon?: boolean
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const COMP_COLORS: Record<string, string> = {
  UCL: '#4da6ff',
  PL:  '#8b5cf6',
  BUN: '#ef4444',
  SA:  '#4da6ff',
  LL:  '#f97316',
}

const MATCHES: MatchRow[] = [
  { id: '1', comp: 'UCL', compColor: COMP_COLORS.UCL, homeTeam: 'Arsenal',     homeLogo: '', awayTeam: 'Barcelona',      awayLogo: '', homeScore: 2, awayScore: 1, status: 'LIVE', minute: 67 },
  { id: '2', comp: 'UCL', compColor: COMP_COLORS.UCL, homeTeam: 'Man City',    homeLogo: '', awayTeam: 'Real Madrid',     awayLogo: '', homeScore: 0, awayScore: 0, status: 'LIVE', minute: 23 },
  { id: '3', comp: 'UCL', compColor: COMP_COLORS.UCL, homeTeam: 'Liverpool',   homeLogo: '', awayTeam: 'PSG',             awayLogo: '', homeScore: 3, awayScore: 2, status: 'HT' },
  { id: '4', comp: 'BUN', compColor: COMP_COLORS.BUN, homeTeam: 'Bayern Munich',homeLogo:'', awayTeam: 'Inter Milan',     awayLogo: '', homeScore: 1, awayScore: 1, status: 'LIVE', minute: 78 },
  { id: '5', comp: 'UCL', compColor: COMP_COLORS.UCL, homeTeam: 'Dortmund',    homeLogo: '', awayTeam: 'AC Milan',        awayLogo: '', homeScore: 1, awayScore: 2, status: 'LIVE', minute: 55 },
  { id: '6', comp: 'PL',  compColor: COMP_COLORS.PL,  homeTeam: 'Chelsea',     homeLogo: '', awayTeam: 'Tottenham',       awayLogo: '', homeScore: null, awayScore: null, status: 'UPCOMING', kickoff: '19:45', soon: true },
  { id: '7', comp: 'SA',  compColor: COMP_COLORS.SA,  homeTeam: 'Juventus',    homeLogo: '', awayTeam: 'Atlético Madrid', awayLogo: '', homeScore: 2, awayScore: 0, status: 'FINISHED' },
]

const liveCount = MATCHES.filter((m) => m.status === 'LIVE' || m.status === 'HT').length

// ── Team logo placeholder ─────────────────────────────────────────────────────

function TeamLogo({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
      <span className="text-[9px] font-black text-muted-foreground">{initials}</span>
    </div>
  )
}

// ── Score / time display ──────────────────────────────────────────────────────

function ScoreDisplay({ match }: { match: MatchRow }) {
  if (match.status === 'UPCOMING') {
    return (
      <div className="flex flex-col items-center gap-0.5 w-24 shrink-0">
        <span className="flex items-center gap-1 text-primary text-[14px] font-bold">
          <Clock className="h-3.5 w-3.5" />
          {match.kickoff}
        </span>
        {match.soon && (
          <span className="text-[10px] font-bold text-primary/70 tracking-wider">SOON</span>
        )}
      </div>
    )
  }

  if (match.status === 'FINISHED') {
    return (
      <div className="flex flex-col items-center gap-0.5 w-24 shrink-0">
        <span className="text-[22px] font-black tabular-nums text-foreground">
          {match.homeScore} &nbsp; {match.awayScore}
        </span>
        <span className="text-[10px] font-bold text-muted-foreground">FT</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-0.5 w-24 shrink-0">
      <span className="text-[22px] font-black tabular-nums text-foreground">
        {match.homeScore} &nbsp; {match.awayScore}
      </span>
      {match.status === 'HT' ? (
        <span className="text-[10px] font-bold text-orange-400">HT</span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] font-bold text-live">
          <span className="h-1 w-1 rounded-full bg-live animate-pulse" />
          {match.minute}&apos;
        </span>
      )}
    </div>
  )
}

// ── Match row ─────────────────────────────────────────────────────────────────

function MatchRow({ match }: { match: MatchRow }) {
  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex items-center gap-4 px-5 py-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card-hover transition-colors"
    >
      {/* Competition tag */}
      <span
        className="text-[10px] font-black uppercase w-8 shrink-0"
        style={{ color: match.compColor }}
      >
        {match.comp}
      </span>

      {/* Home team */}
      <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0">
        <span className="text-[14px] font-semibold text-right truncate">{match.homeTeam}</span>
        <TeamLogo name={match.homeTeam} />
      </div>

      {/* Score */}
      <ScoreDisplay match={match} />

      {/* Away team */}
      <div className="flex items-center gap-2.5 flex-1 justify-start min-w-0">
        <TeamLogo name={match.awayTeam} />
        <span className="text-[14px] font-semibold truncate">{match.awayTeam}</span>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <h2 className="text-[11px] font-black uppercase tracking-widest" style={{ color }}>
        {label}
      </h2>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' },
  { label: `Live (${liveCount})`, value: 'LIVE' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Finished', value: 'FINISHED' },
]

export default function LivePage() {
  const [filter, setFilter] = useState<Filter>('ALL')

  const liveMatches     = MATCHES.filter((m) => m.status === 'LIVE' || m.status === 'HT')
  const upcomingMatches = MATCHES.filter((m) => m.status === 'UPCOMING')
  const finishedMatches = MATCHES.filter((m) => m.status === 'FINISHED')

  const showLive     = filter === 'ALL' || filter === 'LIVE'
  const showUpcoming = filter === 'ALL' || filter === 'UPCOMING'
  const showFinished = filter === 'ALL' || filter === 'FINISHED'

  const filteredLive     = showLive     ? liveMatches     : []
  const filteredUpcoming = showUpcoming ? upcomingMatches : []
  const filteredFinished = showFinished ? finishedMatches : []

  return (
    <>
      {/* Dark page header */}
      <div className="bg-[#111111] dark:bg-[#111111] border-b border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-1">
            <h1 className="flex items-center gap-2 text-3xl font-black text-white">
              Live Centre
            </h1>
          </div>
          <p className="text-[13px] text-[#888]">Real-time scores from across football</p>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mt-5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'px-5 py-1.5 rounded-full text-[12px] font-bold transition-colors border',
                  filter === f.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Match sections */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6 space-y-8">

        {/* Live Now */}
        {filteredLive.length > 0 && (
          <section>
            <SectionLabel label="Live Now" color="#ef4444" />
            <div className="space-y-2">
              {filteredLive.map((m) => <MatchRow key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* Upcoming Today */}
        {filteredUpcoming.length > 0 && (
          <section>
            <SectionLabel label="Upcoming Today" color="#22c55e" />
            <div className="space-y-2">
              {filteredUpcoming.map((m) => <MatchRow key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* Recently Finished */}
        {filteredFinished.length > 0 && (
          <section>
            <SectionLabel label="Recently Finished" color="#888888" />
            <div className="space-y-2">
              {filteredFinished.map((m) => <MatchRow key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filteredLive.length === 0 && filteredUpcoming.length === 0 && filteredFinished.length === 0 && (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No matches found.
          </div>
        )}
      </div>
    </>
  )
}
