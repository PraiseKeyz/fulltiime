'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Goal } from 'lucide-react'
import { cn, formatMatchDate } from '@/lib/utils'
import { latestGoal } from './order-hero-matches'
import type { Match } from '@/lib/api/domain'

// Per-league accent for the background glow. Falls back to a neutral blue.
const LEAGUE_ACCENT: Record<string, string> = {
  'Premier League':       '#7c3aed',
  'La Liga':              '#dc2626',
  'Serie A':              '#0ea5e9',
  'Bundesliga':           '#ef4444',
  'World Cup':            '#3b82f6',
  'CAF Champions League': '#65a30d',
}

function leagueAccent(name?: string): string {
  return (name && LEAGUE_ACCENT[name]) || '#3b82f6'
}

function useCountdown(kickoff: string) {
  const [diff, setDiff] = useState(new Date(kickoff).getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(kickoff).getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [kickoff])
  if (diff <= 0) return null
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  }
}

function StatusBadge({ match }: { match: Match }) {
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'
  if (isLive) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-black text-live uppercase tracking-wide">
        <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
        {match.status === 'HALFTIME' ? 'Half Time' : `Live · ${match.minute ?? 0}'`}
      </span>
    )
  }
  if (match.status === 'FINISHED') return <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wide">Full Time</span>
  return <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wide">{formatMatchDate(match.kickoff_at)}</span>
}

function TeamColumn({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center overflow-hidden">
        {logo
          ? <img src={logo} alt={name} className="h-12 w-12 object-contain" />
          : <span className="text-xl font-black text-muted-foreground">{name[0]}</span>
        }
      </div>
      <span className="text-[14px] font-bold text-center leading-tight line-clamp-2">{name}</span>
    </div>
  )
}

function CenterDisplay({ match }: { match: Match }) {
  const countdown = useCountdown(match.kickoff_at)
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'

  if (match.status === 'SCHEDULED' && countdown) {
    return (
      <div className="flex flex-col items-center gap-1 px-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kicks off</span>
        <span className="text-2xl font-black tabular-nums">
          {countdown.d > 0 ? `${countdown.d}d ` : ''}
          {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-2">
      <span className={cn('text-4xl font-black tabular-nums', isLive && 'text-live')}>
        {match.home_score ?? 0} : {match.away_score ?? 0}
      </span>
    </div>
  )
}

function StatBar({ label, home, away, suffix = '' }: { label: string; home: number; away: number; suffix?: string }) {
  const total = home + away || 1
  const homeW = Math.round((home / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-semibold">
        <span className="tabular-nums">{home}{suffix}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="tabular-nums">{away}{suffix}</span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="flex flex-1 justify-end rounded-l-full overflow-hidden bg-border">
          <div className="bg-primary rounded-l-full" style={{ width: `${homeW}%` }} />
        </div>
        <div className="flex flex-1 rounded-r-full overflow-hidden bg-border">
          <div className="bg-muted-foreground/60 rounded-r-full" style={{ width: `${100 - homeW}%` }} />
        </div>
      </div>
    </div>
  )
}

function MatchStats({ match }: { match: Match }) {
  const home = match.statistics?.find(s => s.team_id === match.home_team.id)
  const away = match.statistics?.find(s => s.team_id === match.away_team.id)

  const rows = [
    { label: 'Possession', h: home?.possession ?? null, a: away?.possession ?? null, suffix: '%' },
    { label: 'Shots',      h: home?.shots ?? null,      a: away?.shots ?? null },
    { label: 'xG',         h: home?.xg ?? null,         a: away?.xg ?? null },
  ].filter(r => r.h !== null || r.a !== null)

  if (rows.length === 0) return null

  return (
    <div className="space-y-2.5 w-full max-w-sm mx-auto">
      {rows.map(r => (
        <StatBar key={r.label} label={r.label} home={r.h ?? 0} away={r.a ?? 0} suffix={r.suffix} />
      ))}
    </div>
  )
}

export function HeroCard({ match }: { match: Match }) {
  const league = match.season?.league
  const goal   = latestGoal(match)
  const showStats = match.status !== 'SCHEDULED'
  const accent = leagueAccent(league?.name)

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card h-full">
      {/* Colored glow + league-logo background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(130% 130% at 88% 0%, ${accent}33, transparent 55%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl opacity-20"
        style={{ background: accent }}
      />
      {league?.logo_url && (
        <img
          src={league.logo_url}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 object-contain opacity-[0.10] blur-[1px]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/70 to-transparent" />

      {/* Content — fills the column height: header top, body centered, CTA bottom */}
      <div className="relative p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {league?.logo_url && <img src={league.logo_url} alt="" className="h-5 w-5 object-contain shrink-0" />}
            <span className="text-[12px] font-bold uppercase tracking-wide text-primary truncate">{league?.name}</span>
          </div>
          <StatusBadge match={match} />
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col justify-center gap-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <TeamColumn name={match.home_team.name} logo={match.home_team.logo_url} />
            <CenterDisplay match={match} />
            <TeamColumn name={match.away_team.name} logo={match.away_team.logo_url} />
          </div>

          {showStats && <MatchStats match={match} />}

          {/* Scorer line / venue */}
          <div className="min-h-[20px] flex items-center justify-center text-center">
            {goal ? (
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
                <Goal className="h-3.5 w-3.5" />
                {goal.player_name}{goal.minute ? ` ${goal.minute}'` : ''}
              </span>
            ) : match.venue ? (
              <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {match.venue}
              </span>
            ) : null}
          </div>
        </div>

        {/* CTA — pinned to the bottom */}
        <Link
          href={`/matches/${match.id}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-[13px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View Match
        </Link>
      </div>
    </div>
  )
}
