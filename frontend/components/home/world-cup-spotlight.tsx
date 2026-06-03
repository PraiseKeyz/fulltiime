'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { formatKickoff, formatMatchDate } from '@/lib/utils'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import { useUpcomingFixtures } from '@/lib/api/hooks/fixtures.hooks'
import type { Match } from '@/lib/api/domain'

const WC_START = new Date('2026-06-11T19:00:00Z')

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl lg:text-4xl font-black tabular-nums text-foreground">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <span className="text-2xl font-black text-muted-foreground pb-4">:</span>
}

function FixtureRow({ match }: { match: Match }) {
  const home = match.home_team
  const away = match.away_team
  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg hover:bg-muted transition-colors group"
    >
      <span className="text-[11px] text-muted-foreground w-12 shrink-0">{formatMatchDate(match.kickoff_at)}</span>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {home.logo_url
          ? <img src={home.logo_url} alt={home.name} className="h-5 w-5 object-contain shrink-0" />
          : <div className="h-5 w-5 rounded-full bg-muted shrink-0" />
        }
        <span className="text-[12px] font-bold text-foreground truncate">{home.short_name ?? home.name}</span>
      </div>

      <span className="text-[11px] font-bold text-muted-foreground shrink-0">vs</span>

      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-[12px] font-bold text-foreground truncate text-right">{away.short_name ?? away.name}</span>
        {away.logo_url
          ? <img src={away.logo_url} alt={away.name} className="h-5 w-5 object-contain shrink-0" />
          : <div className="h-5 w-5 rounded-full bg-muted shrink-0" />
        }
      </div>

      <span className="text-[11px] font-semibold text-muted-foreground shrink-0 w-10 text-right">
        {formatKickoff(match.kickoff_at)}
      </span>
    </Link>
  )
}

export function WorldCupSpotlight() {
  const countdown = useCountdown(WC_START)
  const { data: leagues } = useLeagues()

  const wcLeague = useMemo(
    () => leagues?.find(l => l.name === 'World Cup'),
    [leagues]
  )

  const { data: fixtures, isLoading } = useUpcomingFixtures(wcLeague?.id, 8)

  if (!countdown && !fixtures?.length) return null

  return (
    <section className="py-8">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            {wcLeague?.logo_url && (
              <img src={wcLeague.logo_url} alt="World Cup" className="h-6 w-6 object-contain" />
            )}
            World Cup 2026
          </h2>
          <Link href="/competitions" className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-card">
          {/* Countdown */}
          {countdown && (
            <div className="px-6 py-8 text-center border-b border-border">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Kicks off June 11 · USA, Canada &amp; Mexico
              </p>
              <div className="flex items-end justify-center gap-3">
                <CountdownUnit value={countdown.days}    label="Days"    />
                <Divider />
                <CountdownUnit value={countdown.hours}   label="Hours"   />
                <Divider />
                <CountdownUnit value={countdown.minutes} label="Minutes" />
                <Divider />
                <CountdownUnit value={countdown.seconds} label="Seconds" />
              </div>
            </div>
          )}

          {/* Upcoming fixtures */}
          <div className="p-2">
            {isLoading ? (
              <div className="space-y-1 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : fixtures?.length ? (
              <div className="space-y-0.5">
                {fixtures.map(m => <FixtureRow key={m.id} match={m} />)}
              </div>
            ) : (
              <p className="text-center text-[13px] text-muted-foreground py-6">
                Fixtures will appear here once the schedule is released
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
