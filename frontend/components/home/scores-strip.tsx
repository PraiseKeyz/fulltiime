'use client'

import { useState, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn, formatMinute } from '@/lib/utils'
import { useTimeFormat } from '@/lib/hooks/use-time-format'
import { useLiveClock } from '@/lib/hooks/use-live-clock'
import { useTodayFixtures } from '@/lib/api/hooks/fixtures.hooks'
import { Button } from '@/components/ui/button'
import type { Match } from '@/lib/api/domain'

const TABS = [
  { key: 'all',              label: 'All'  },
  { key: 'Premier League',   label: 'PL'   },
  { key: 'Champions League', label: 'UCL'  },
  { key: 'La Liga',          label: 'LL'   },
  { key: 'Serie A',          label: 'SA'   },
  { key: 'Bundesliga',       label: 'BUN'  },
  { key: 'Europa League',    label: 'EL'   },
]

const LEAGUE_SHORT: Record<string, string> = {
  'Premier League':   'PL',
  'Champions League': 'UCL',
  'La Liga':          'LL',
  'Serie A':          'SA',
  'Bundesliga':       'BUN',
  'Europa League':    'EL',
}

const STATUS_ORDER: Record<string, number> = {
  LIVE: 0, HALFTIME: 1, INTERRUPTED: 1, SCHEDULED: 2, FINISHED: 3, POSTPONED: 4, CANCELLED: 5,
}

function sortMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const diff = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
    if (diff !== 0) return diff
    if (a.status === 'LIVE') return (b.minute ?? 0) - (a.minute ?? 0)
    return new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime()
  })
}

function TeamRow({
  name, shortName, logo, score, isLive, isScheduled,
}: {
  name: string
  shortName: string | null
  logo: string | null
  score: number | null
  isLive: boolean
  isScheduled: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 min-w-0">
        {logo ? (
          <img src={logo} alt={name} className="h-4 w-4 object-contain shrink-0" />
        ) : (
          <div className="h-4 w-4 rounded-full bg-muted shrink-0 flex items-center justify-center text-[7px] font-black text-muted-foreground">
            {name[0]}
          </div>
        )}
        <span className="text-[12px] font-bold truncate">
          {shortName ?? name.slice(0, 3).toUpperCase()}
        </span>
      </div>
      <span className={cn('text-[13px] font-black tabular-nums', isLive && 'text-live')}>
        {isScheduled ? '' : (score ?? '—')}
      </span>
    </div>
  )
}

function StatusLabel({ match }: { match: Match }) {
  const { formatKickoff } = useTimeFormat()
  const clock = useLiveClock(match)
  const { status, kickoff_at } = match
  if (status === 'LIVE') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold">
        <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
        {clock.minute != null
          ? <span className="text-foreground">{formatMinute(clock.minute, clock.extraMinute, clock.seconds)}</span>
          : <span className="text-live">LIVE</span>
        }
      </span>
    )
  }
  if (status === 'HALFTIME')  return <span className="text-[10px] font-bold text-primary">HT</span>
  if (status === 'INTERRUPTED') return <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">INT</span>
  if (status === 'FINISHED')  return <span className="text-[10px] font-semibold text-muted-foreground">FT</span>
  if (status === 'SCHEDULED') return <span className="text-[11px] font-semibold">{formatKickoff(kickoff_at)}</span>
  if (status === 'POSTPONED') return <span className="text-[10px] text-muted-foreground font-semibold">PST</span>
  return null
}

function StripCard({ match }: { match: Match }) {
  const isLive      = match.status === 'LIVE' || match.status === 'HALFTIME' || match.status === 'INTERRUPTED'
  const isScheduled = match.status === 'SCHEDULED'
  const leagueName  = match.season?.league?.name ?? ''
  const leagueShort = LEAGUE_SHORT[leagueName] ?? (leagueName.slice(0, 3).toUpperCase() || '—')

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        'shrink-0 w-[140px] rounded-lg border border-border bg-card hover:border-primary/40 transition-colors p-3 space-y-2',
        isLive && 'border-live/30 bg-live/[0.04]',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {leagueShort}
        </span>
        <StatusLabel match={match} />
      </div>
      <TeamRow
        name={match.home_team.name}
        shortName={match.home_team.short_name}
        logo={match.home_team.logo_url}
        score={match.home_score}
        isLive={isLive}
        isScheduled={isScheduled}
      />
      <TeamRow
        name={match.away_team.name}
        shortName={match.away_team.short_name}
        logo={match.away_team.logo_url}
        score={match.away_score}
        isLive={isLive}
        isScheduled={isScheduled}
      />
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-[140px] rounded-lg border border-border bg-card p-3 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-8 rounded bg-muted" />
        <div className="h-3 w-10 rounded bg-muted" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-4 rounded bg-muted" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-4 rounded bg-muted" />
      </div>
    </div>
  )
}

export function ScoresStrip() {
  const [tab, setTab] = useState('all')
  const { data: matches, isLoading } = useTodayFixtures()

  const filtered = useMemo(() => {
    if (!matches) return []
    const base = tab === 'all'
      ? matches
      : matches.filter(m => m.season?.league?.name === tab)
    return sortMatches(base)
  }, [matches, tab])

  const hasLive = matches?.some(m => m.status === 'LIVE' || m.status === 'HALFTIME' || m.status === 'INTERRUPTED') ?? false

  if (!isLoading && !filtered.length) return null

  return (
    <section className="bg-background-secondary border-b border-border">
      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 pt-3 pb-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
            {hasLive && <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />}
            Scores &amp; Fixtures
          </h2>
          <Link href="/matches" className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
            All Matches <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* League tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none mb-3">
          {TABS.map(t => (
            <Button
              key={t.key}
              onClick={() => setTab(t.key)}
              variant={tab === t.key ? 'primary' : 'ghost'}
              size="sm"
              className={cn('shrink-0 rounded-md text-[11px]', tab !== t.key && 'text-muted-foreground')}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? null : (
            filtered.map(m => <StripCard key={m.id} match={m} />)
          )}
        </div>
      </div>
    </section>
  )
}
