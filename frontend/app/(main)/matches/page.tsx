'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, Clock, ChevronRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn, formatKickoff } from '@/lib/utils'
import { api } from '@/lib/api/instance'
import type { Match } from '@/lib/api/domain'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDateString(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

function formatDateLabel(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  if (offset === 0) return 'Today'
  if (offset === -1) return 'Yesterday'
  if (offset === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

type StatusGroup = 'live' | 'upcoming' | 'finished'
type Filter = 'ALL' | 'LIVE' | 'UPCOMING' | 'FINISHED'

interface LeagueGroup {
  leagueId:   string
  leagueName: string
  leagueLogo: string | null
  matches:    Match[]
}

function groupByLeague(matches: Match[]): LeagueGroup[] {
  const map = new Map<string, LeagueGroup>()
  for (const match of matches) {
    const id   = match.season?.league?.id ?? 'unknown'
    const name = match.season?.league?.name ?? 'Unknown'
    const logo = match.season?.league?.logo_url ?? null
    if (!map.has(id)) map.set(id, { leagueId: id, leagueName: name, leagueLogo: logo, matches: [] })
    map.get(id)!.matches.push(match)
  }
  return Array.from(map.values())
}

// ── Components ────────────────────────────────────────────────────────────────

function StatusBadge({ match }: { match: Match }) {
  const { status, minute, kickoff_at } = match
  if (status === 'LIVE') return (
    <span className="flex items-center gap-1 text-[11px] font-black text-live">
      <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
      {minute ? `${minute}'` : 'LIVE'}
    </span>
  )
  if (status === 'HALFTIME') return <span className="text-[11px] font-black text-orange-400">HT</span>
  if (status === 'FINISHED')  return <span className="text-[11px] font-semibold text-muted-foreground">FT</span>
  if (status === 'SCHEDULED') return (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
      <Clock className="h-3 w-3" />
      {formatKickoff(kickoff_at)}
    </span>
  )
  if (status === 'POSTPONED') return <span className="text-[11px] text-muted-foreground font-semibold">PST</span>
  return null
}

function MatchRow({ match }: { match: Match }) {
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'
  const hasScore = match.home_score !== null && match.away_score !== null

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        'flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors',
        isLive && 'bg-live/[0.03]',
      )}
    >
      {/* Home team */}
      <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0">
        <span className="text-[13px] font-semibold text-right truncate">
          {match.home_team.short_name ?? match.home_team.name}
        </span>
        {match.home_team.logo_url ? (
          <img src={match.home_team.logo_url} alt="" className="h-7 w-7 object-contain shrink-0" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
        )}
      </div>

      {/* Score / time */}
      <div className="flex flex-col items-center gap-0.5 w-24 shrink-0">
        {hasScore ? (
          <span className={cn('text-[20px] font-black tabular-nums', isLive && 'text-live')}>
            {match.home_score} – {match.away_score}
          </span>
        ) : (
          <span className="text-[15px] font-bold text-muted-foreground">vs</span>
        )}
        <StatusBadge match={match} />
      </div>

      {/* Away team */}
      <div className="flex items-center gap-2.5 flex-1 justify-start min-w-0">
        {match.away_team.logo_url ? (
          <img src={match.away_team.logo_url} alt="" className="h-7 w-7 object-contain shrink-0" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
        )}
        <span className="text-[13px] font-semibold truncate">
          {match.away_team.short_name ?? match.away_team.name}
        </span>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  )
}

function LeagueSection({ group }: { group: LeagueGroup }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* League header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
        {group.leagueLogo ? (
          <img src={group.leagueLogo} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <div className="h-5 w-5 rounded-full bg-muted" />
        )}
        <span className="text-[12px] font-black uppercase tracking-wide">{group.leagueName}</span>
        <span className="ml-auto text-[11px] text-muted-foreground">{group.matches.length} matches</span>
      </div>

      {/* Matches */}
      <div className="divide-y divide-border">
        {group.matches.map(m => <MatchRow key={m.id} match={m} />)}
      </div>
    </div>
  )
}

function SectionHeader({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <h2 className="text-[11px] font-black uppercase tracking-widest" style={{ color }}>
        {label}
      </h2>
      <span className="text-[11px] text-muted-foreground font-semibold">({count})</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card p-16 text-center">
      <p className="text-muted-foreground text-sm">No matches found for this date.</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',      value: 'ALL'      },
  { label: 'Live',     value: 'LIVE'     },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Finished', value: 'FINISHED' },
]

export default function MatchesPage() {
  const [filter,    setFilter]    = useState<Filter>('ALL')
  const [dayOffset, setDayOffset] = useState(0)

  const dateStr = getDateString(dayOffset)

  const { data: matches, isLoading } = useQuery({
    queryKey:       ['fixtures', 'date', dateStr],
    queryFn:        () => api.get<Match[]>('/fixtures', { params: { date: dateStr } }),
    refetchInterval: (query) => {
      const hasLive = query.state.data?.some(
        m => m.status === 'LIVE' || m.status === 'HALFTIME'
      )
      return hasLive ? 30_000 : 5 * 60_000
    },
  })

  const liveMatches     = useMemo(() => matches?.filter(m => m.status === 'LIVE' || m.status === 'HALFTIME') ?? [], [matches])
  const upcomingMatches = useMemo(() => matches?.filter(m => m.status === 'SCHEDULED') ?? [], [matches])
  const finishedMatches = useMemo(() => matches?.filter(m => m.status === 'FINISHED') ?? [], [matches])

  const liveGroups     = useMemo(() => groupByLeague(liveMatches),     [liveMatches])
  const upcomingGroups = useMemo(() => groupByLeague(upcomingMatches), [upcomingMatches])
  const finishedGroups = useMemo(() => groupByLeague(finishedMatches), [finishedMatches])

  const showLive     = filter === 'ALL' || filter === 'LIVE'
  const showUpcoming = filter === 'ALL' || filter === 'UPCOMING'
  const showFinished = filter === 'ALL' || filter === 'FINISHED'

  const hasAnything =
    (showLive     && liveGroups.length > 0) ||
    (showUpcoming && upcomingGroups.length > 0) ||
    (showFinished && finishedGroups.length > 0)

  // When a current/future date has no matches, fall back to the next upcoming
  // fixtures across all competitions (naturally surfaces the World Cup right now).
  // Past dates keep the plain empty state.
  const dateIsEmpty  = dayOffset >= 0 && !isLoading && (matches?.length ?? 0) === 0
  const showFallback = dateIsEmpty && (filter === 'ALL' || filter === 'UPCOMING')

  const { data: comingUp, isLoading: comingUpLoading } = useQuery({
    queryKey: ['fixtures', 'upcoming', 'fallback'],
    queryFn:  () => api.get<Match[]>('/fixtures/upcoming', { params: { limit: 20 } }),
    enabled:  showFallback,
    staleTime: 5 * 60_000,
  })

  const comingUpGroups = useMemo(() => groupByLeague(comingUp ?? []), [comingUp])

  return (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="flex items-center gap-2 text-3xl font-black">
              <Zap className="h-7 w-7 text-primary fill-primary" />
              Matches
            </h1>
            {liveMatches.length > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-live/20 border border-live/40 px-3 py-1 text-[11px] font-black text-live">
                <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
                {liveMatches.length} LIVE
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">Scores and fixtures from across football</p>

          <div className="flex items-center justify-between mt-5 gap-4 flex-wrap">
            {/* Filter tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'px-5 py-1.5 rounded-full text-[12px] font-bold transition-colors border',
                    filter === f.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'text-muted-foreground border-border hover:text-foreground',
                  )}
                >
                  {f.value === 'LIVE' && liveMatches.length > 0
                    ? `Live (${liveMatches.length})`
                    : f.label
                  }
                </button>
              ))}
            </div>

            {/* Date navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDayOffset(d => d - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[13px] font-bold min-w-[80px] text-center">
                {formatDateLabel(dayOffset)}
              </span>
              <button
                onClick={() => setDayOffset(d => d + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6 space-y-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : !hasAnything ? (
          showFallback ? (
            <section>
              <p className="text-[13px] text-muted-foreground mb-4">
                No matches {dayOffset === 0 ? 'today' : dayOffset === 1 ? 'tomorrow' : `on ${formatDateLabel(dayOffset)}`} — here&apos;s what&apos;s coming up next.
              </p>
              <SectionHeader label="Coming Up" color="#22c55e" count={comingUp?.length ?? 0} />
              {comingUpLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
                  ))}
                </div>
              ) : comingUpGroups.length > 0 ? (
                <div className="space-y-3">
                  {comingUpGroups.map(g => <LeagueSection key={g.leagueId} group={g} />)}
                </div>
              ) : (
                <EmptyState />
              )}
            </section>
          ) : (
            <EmptyState />
          )
        ) : (
          <>
            {showLive && liveGroups.length > 0 && (
              <section>
                <SectionHeader label="Live Now" color="#ef4444" count={liveMatches.length} />
                <div className="space-y-3">
                  {liveGroups.map(g => <LeagueSection key={g.leagueId} group={g} />)}
                </div>
              </section>
            )}

            {showUpcoming && upcomingGroups.length > 0 && (
              <section>
                <SectionHeader label="Upcoming" color="#22c55e" count={upcomingMatches.length} />
                <div className="space-y-3">
                  {upcomingGroups.map(g => <LeagueSection key={g.leagueId} group={g} />)}
                </div>
              </section>
            )}

            {showFinished && finishedGroups.length > 0 && (
              <section>
                <SectionHeader label="Finished" color="#888888" count={finishedMatches.length} />
                <div className="space-y-3">
                  {finishedGroups.map(g => <LeagueSection key={g.leagueId} group={g} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
