'use client'

import { useEffect, useState } from 'react'
import { Play, BookOpen, MapPin, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn, formatKickoff } from '@/lib/utils'
import { useFeaturedMatch } from '@/lib/api/hooks/fixtures.hooks'
import type { Match, MatchStatistic } from '@/lib/api/domain'

// ── Stat bar ──────────────────────────────────────────────────────────────────

function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1
  const homeW = Math.round((home / total) * 100)
  const awayW = Math.round((away / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-semibold text-foreground/70">
        <span>{home}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="flex flex-1 justify-end rounded-l-full overflow-hidden bg-border">
          <div className="bg-primary rounded-l-full" style={{ width: `${homeW}%` }} />
        </div>
        <div className="flex flex-1 rounded-r-full overflow-hidden bg-border">
          <div className="bg-muted-foreground/60 rounded-r-full" style={{ width: `${awayW}%` }} />
        </div>
      </div>
    </div>
  )
}

// ── Countdown ─────────────────────────────────────────────────────────────────

function useCountdown(kickoff: string) {
  const [diff, setDiff] = useState(new Date(kickoff).getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(kickoff).getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [kickoff])
  if (diff <= 0) return null
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  }
}

function Countdown({ kickoff }: { kickoff: string }) {
  const t = useCountdown(kickoff)
  if (!t) return <span className="text-sm text-muted-foreground">Kick-off soon</span>
  return (
    <div className="flex items-center gap-1 text-2xl font-black tabular-nums text-foreground">
      {t.h > 0 && <><span>{String(t.h).padStart(2, '0')}</span><span className="text-muted-foreground text-lg">h</span></>}
      <span>{String(t.m).padStart(2, '0')}</span>
      <span className="text-muted-foreground text-lg">m</span>
      <span>{String(t.s).padStart(2, '0')}</span>
      <span className="text-muted-foreground text-lg">s</span>
    </div>
  )
}

// ── Team display ──────────────────────────────────────────────────────────────

function TeamDisplay({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {logo ? (
          <img src={logo} alt={name} className="h-12 w-12 object-contain" />
        ) : (
          <span className="text-xl font-black text-muted-foreground">{name[0]}</span>
        )}
      </div>
      <span className="text-base font-bold text-foreground text-center leading-tight">{name}</span>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function MatchStatusBadge({ match, type }: { match: Match; type: string }) {
  const leagueName = match.season?.league?.name ?? ''
  if (type === 'live') {
    return (
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
        <span className="text-primary">{leagueName}</span>
        <span className="flex items-center gap-1.5 text-live">
          <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
          {match.status === 'HALFTIME' ? 'HALF TIME' : `LIVE — ${match.minute ?? 0}'`}
        </span>
      </div>
    )
  }
  if (type === 'upcoming') {
    return (
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
        <span className="text-primary">{leagueName}</span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatKickoff(match.kickoff_at)}
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
      <span className="text-primary">{leagueName}</span>
      <span className="text-muted-foreground">FULL TIME</span>
    </div>
  )
}

// ── Score / countdown ─────────────────────────────────────────────────────────

function ScoreDisplay({ match, type }: { match: Match; type: string }) {
  if (type === 'upcoming') {
    return (
      <div className="text-center space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Kicks off in</p>
        <Countdown kickoff={match.kickoff_at} />
        <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {match.venue ?? 'Venue TBC'}
        </p>
      </div>
    )
  }
  const isLive = type === 'live'
  return (
    <div className="text-center">
      <div className={cn('text-5xl font-black tracking-tight text-foreground', !isLive && 'opacity-80')}>
        {match.home_score ?? 0} : {match.away_score ?? 0}
      </div>
      <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mt-1.5">
        <MapPin className="h-3 w-3" />
        {match.venue ?? 'Venue TBC'}
      </p>
    </div>
  )
}

// ── CTAs ──────────────────────────────────────────────────────────────────────

function MatchCTAs({ match, type }: { match: Match; type: string }) {
  const secondaryBtn = 'flex items-center justify-center gap-2 rounded-lg bg-muted py-3 text-[13px] font-bold text-foreground hover:bg-muted/70 transition-colors border border-border'

  if (type === 'upcoming') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/matches/${match.id}`} className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-[13px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
          <BookOpen className="h-4 w-4" /> Match Preview
        </Link>
        <Link href="/matches" className={secondaryBtn}>
          <Clock className="h-4 w-4" /> All Fixtures
        </Link>
      </div>
    )
  }

  if (type === 'live') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/matches/${match.id}`} className="flex items-center justify-center gap-2 rounded-lg bg-live py-3 text-[13px] font-bold text-white hover:bg-live/90 transition-colors">
          <Play className="h-4 w-4 fill-current" /> Follow Live
        </Link>
        <Link href={`/matches/${match.id}`} className={secondaryBtn}>
          <BookOpen className="h-4 w-4" /> Match Stats
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href={`/matches/${match.id}`} className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-[13px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
        <BookOpen className="h-4 w-4" /> Match Report
      </Link>
      <Link href={`/matches/${match.id}`} className={secondaryBtn}>
        Full Stats
      </Link>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <section className="bg-card">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-4 grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="rounded-xl bg-background-secondary border border-border p-5 space-y-5 animate-pulse">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="h-16 w-16 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
            <div className="h-12 w-24 rounded bg-muted" />
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="h-16 w-16 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-6 rounded bg-muted" />)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 rounded-lg bg-muted" />
            <div className="h-11 rounded-lg bg-muted" />
          </div>
        </div>
        <div className="rounded-xl bg-background-secondary border border-border p-4 animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded bg-muted" />)}
        </div>
      </div>
    </section>
  )
}

// ── Trending sidebar ──────────────────────────────────────────────────────────

function TrendingItem({ index, tag, tagColor, title, time }: {
  index: string; tag: string; tagColor: string; title: string; time: string
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
      <span className="text-2xl font-black text-muted-foreground/30 leading-none w-6 shrink-0">{index}</span>
      <div className="min-w-0">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: tagColor }}>
          {tag}
        </span>
        <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">{time}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
    </div>
  )
}

// ── Hero section ──────────────────────────────────────────────────────────────

export function HeroSection() {
  const { data, isLoading } = useFeaturedMatch()

  if (isLoading) return <HeroSkeleton />

  const match = data?.match
  const type  = data?.type ?? 'finished'

  if (!match) return null

  const homeStats = match.statistics?.find(s => s.team_id === match.home_team.id)
  const awayStats = match.statistics?.find(s => s.team_id === match.away_team.id)
  const hasStats  = !!(homeStats || awayStats)

  return (
    <section className="bg-card">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-4 grid lg:grid-cols-[1fr_320px] gap-4">

        {/* Featured match widget */}
        <div className="rounded-xl bg-background-secondary border border-border p-5 space-y-5">
          <MatchStatusBadge match={match} type={type} />
          <div className="flex items-center justify-between gap-4">
            <TeamDisplay name={match.home_team.name} logo={match.home_team.logo_url} />
            <ScoreDisplay match={match} type={type} />
            <TeamDisplay name={match.away_team.name} logo={match.away_team.logo_url} />
          </div>
          {hasStats && type !== 'upcoming' && (
            <div className="space-y-3">
              {homeStats?.possession != null && awayStats?.possession != null && (
                <StatBar label="Possession" home={homeStats.possession} away={awayStats.possession} />
              )}
              {homeStats?.shots != null && awayStats?.shots != null && (
                <StatBar label="Shots" home={homeStats.shots} away={awayStats.shots} />
              )}
              {homeStats?.xg != null && awayStats?.xg != null && (
                <StatBar label="xG" home={homeStats.xg} away={awayStats.xg} />
              )}
            </div>
          )}
          <MatchCTAs match={match} type={type} />
        </div>

        {/* Trending sidebar */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Trending Now
            </h2>
          </div>
          <div className="flex-1 space-y-1">
            <TrendingItem index="01" tag="Champions League" tagColor="#4da6ff" title="Red card controversy: Pedri's early dismissal sparks debate" time="8 min ago" />
            <TrendingItem index="02" tag="Arsenal" tagColor="#ef4444" title="Saka reaches 20 UCL goals for Arsenal — fastest ever" time="22 min ago" />
            <TrendingItem index="03" tag="Barcelona" tagColor="#4da6ff" title="Flick's rotation gamble: Barcelona's squad depth tested" time="45 min ago" />
          </div>
          <Link href="/matches" className="mt-3 flex items-center justify-between rounded-lg border border-border px-4 py-3 text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
            View All Today&apos;s Matches
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
