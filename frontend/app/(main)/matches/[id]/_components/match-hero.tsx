'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, Flag, Shield } from 'lucide-react'
import { cn, formatMinute } from '@/lib/utils'
import { useTimeFormat } from '@/lib/hooks/use-time-format'
import { useLiveClock } from '@/lib/hooks/use-live-clock'
import { useImmersive } from '@/providers/immersive-provider'
import type { MatchView } from './phase'
import { getViewMeta, type ViewMeta } from './view-meta'

// ─── Countdown (upcoming only) ───────────────────────────────────────────────

function useCountdown(kickoff: string | null) {
  const [diff, setDiff] = useState<number | null>(null)
  useEffect(() => {
    if (!kickoff) return
    const tick = () => setDiff(new Date(kickoff).getTime() - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [kickoff])
  if (diff === null || diff <= 0) return null
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  }
}

// ─── Team column ─────────────────────────────────────────────────────────────

function TeamColumn({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex flex-col items-center gap-3 min-w-0">
      {logo
        ? <img src={logo} alt={name} className="h-16 w-16 object-contain" />
        : (
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Shield className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      <span className="text-[15px] font-bold text-center leading-tight">{name}</span>
    </div>
  )
}

// ─── Status badge ────────────────────────────────────────────────────────────

function Badge({ tone, children }: { tone: 'live' | 'muted' | 'amber' | 'red' | 'primary'; children: React.ReactNode }) {
  const toneCls = {
    live:    'bg-live/15 text-live',
    muted:   'bg-muted text-muted-foreground',
    amber:   'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    red:     'bg-red-500/10 text-red-600 dark:text-red-400',
    primary: 'bg-primary/15 text-primary',
  }[tone]
  return (
    <span className={cn('text-[11px] font-black px-2.5 py-1 rounded-full', toneCls)}>
      {children}
    </span>
  )
}

// ─── Phase-specific center ───────────────────────────────────────────────────

function HeroCenter({ view, meta }: { view: MatchView; meta: ViewMeta }) {
  const { formatMatchDate, formatKickoff } = useTimeFormat()
  const countdown = useCountdown(view.phase === 'upcoming' ? meta.date : null)
  const clock = useLiveClock(view.phase === 'live' ? view.match : null)
  const score = `${meta.homeScore} – ${meta.awayScore}`
  const hasScore = meta.homeScore !== null && meta.awayScore !== null

  switch (view.phase) {
    case 'live': {
      const isHT          = view.match.status === 'HALFTIME'
      const isInterrupted = view.match.status === 'INTERRUPTED'
      return (
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <span className="text-5xl font-black tabular-nums">{hasScore ? score : 'vs'}</span>
          {isInterrupted ? (
            <Badge tone="amber">Interrupted</Badge>
          ) : isHT ? (
            <Badge tone="primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse mr-1.5 align-middle" />
              HT
            </Badge>
          ) : (
            <Badge tone="live">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-live animate-pulse mr-1.5 align-middle" />
              {clock.minute != null
                ? <span className="text-foreground">{formatMinute(clock.minute, clock.extraMinute, clock.seconds)}</span>
                : 'LIVE'
              }
            </Badge>
          )}
        </div>
      )
    }

    case 'finished':
      return (
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <span className="text-5xl font-black tabular-nums">{hasScore ? score : '–'}</span>
          <Badge tone="muted">FULL TIME</Badge>
        </div>
      )

    case 'upcoming':
      return (
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          {countdown ? (
            <div className="text-center">
              <div className="flex items-center gap-1 text-xl font-black tabular-nums">
                {countdown.d > 0 && <span>{countdown.d}d</span>}
                <span>{String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Until kick-off</p>
            </div>
          ) : (
            <>
              <span className="text-4xl font-black">vs</span>
              <Badge tone="muted">{meta.date ? formatKickoff(meta.date) : 'SCHEDULED'}</Badge>
            </>
          )}
        </div>
      )

    case 'postponed':
      return (
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <span className="text-4xl font-black text-muted-foreground">vs</span>
          <Badge tone="amber">POSTPONED</Badge>
        </div>
      )

    case 'cancelled':
      return (
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <span className="text-4xl font-black text-muted-foreground">vs</span>
          <Badge tone="red">CANCELLED</Badge>
        </div>
      )

    case 'tbd':
      return (
        <div className="flex flex-col items-center gap-1 min-w-[120px] text-center">
          <span className="text-2xl font-black">{meta.date ? formatKickoff(meta.date) : 'vs'}</span>
          <span className="text-[11px] text-muted-foreground">{meta.date ? formatMatchDate(meta.date) : 'Date TBC'}</span>
        </div>
      )
  }
}

function CompactHero({ view, meta }: { view: MatchView; meta: ViewMeta }) {
  const { formatKickoff } = useTimeFormat()
  const clock = useLiveClock(view.phase === 'live' ? view.match : null)
  const hasScore = meta.homeScore !== null && meta.awayScore !== null

  let status: React.ReactNode = null
  if (view.phase === 'live') {
    const isHT          = view.match.status === 'HALFTIME'
    const isInterrupted = view.match.status === 'INTERRUPTED'
    status = isInterrupted ? (
      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">Interrupted</span>
    ) : isHT ? (
      <span className="text-[10px] font-black text-primary">HT</span>
    ) : (
      <span className="flex items-center gap-1 text-[10px] font-black">
        <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
        {clock.minute != null
          ? <span className="text-foreground">{formatMinute(clock.minute, clock.extraMinute, clock.seconds)}</span>
          : <span className="text-live">LIVE</span>}
      </span>
    )
  } else if (view.phase === 'finished') {
    status = <span className="text-[10px] font-bold text-muted-foreground">FT</span>
  } else if (view.phase === 'upcoming') {
    status = <span className="text-[10px] font-bold text-muted-foreground">{meta.date ? formatKickoff(meta.date) : ''}</span>
  }

  return (
    <div className="-mx-4 lg:-mx-6 flex items-center gap-3 bg-card px-4 lg:px-6 py-4">
      <div className="flex flex-1 min-w-0 items-center justify-end gap-2">
        <span className="truncate text-[13px] font-bold">{meta.home}</span>
        {meta.homeLogo
          ? <img src={meta.homeLogo} alt="" className="h-6 w-6 shrink-0 object-contain" />
          : <Shield className="h-6 w-6 shrink-0 text-muted-foreground/40" />}
      </div>

      <div className="flex w-16 shrink-0 flex-col items-center">
        <span className="text-[16px] font-black tabular-nums">{hasScore ? `${meta.homeScore} – ${meta.awayScore}` : 'vs'}</span>
        {status}
      </div>

      <div className="flex flex-1 min-w-0 items-center gap-2">
        {meta.awayLogo
          ? <img src={meta.awayLogo} alt="" className="h-6 w-6 shrink-0 object-contain" />
          : <Shield className="h-6 w-6 shrink-0 text-muted-foreground/40" />}
        <span className="truncate text-[13px] font-bold">{meta.away}</span>
      </div>
    </div>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export function MatchHero({ view }: { view: MatchView }) {
  const { formatMatchDate, formatKickoff } = useTimeFormat()
  const meta = getViewMeta(view)
  const disrupted = view.phase === 'postponed' || view.phase === 'cancelled'
  const { immersive } = useImmersive()

  if (immersive) return <CompactHero view={view} meta={meta} />

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Link href="/matches" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors mb-5">
        <ArrowLeft className="h-3.5 w-3.5" /> All Matches
      </Link>

      {/* League / stage */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {meta.leagueLogo && <img src={meta.leagueLogo} alt="" className="h-5 w-5 object-contain" />}
        <span className="text-[12px] font-bold uppercase tracking-wider text-primary">
          {meta.league}{meta.stage ? ` · ${meta.stage}` : ''}
        </span>
      </div>

      {/* Teams + center */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <TeamColumn name={meta.home} logo={meta.homeLogo} />
        <HeroCenter view={view} meta={meta} />
        <TeamColumn name={meta.away} logo={meta.awayLogo} />
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-center gap-4 mt-6 text-[11px] text-muted-foreground flex-wrap">
        {meta.date && (
          <span className={cn('flex items-center gap-1', disrupted && 'line-through opacity-70')}>
            <Clock className="h-3 w-3" />
            {formatMatchDate(meta.date)} · {formatKickoff(meta.date)}
          </span>
        )}
        {meta.venueName && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {meta.venueName}
          </span>
        )}
        {meta.referee && (
          <span className="flex items-center gap-1">
            <Flag className="h-3 w-3" /> {meta.referee}
          </span>
        )}
      </div>
    </div>
  )
}
