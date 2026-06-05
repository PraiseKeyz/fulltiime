'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import { api } from '@/lib/api/instance'
import { useLeague } from '@/lib/api/hooks/leagues.hooks'
import { useUpcomingFixtures } from '@/lib/api/hooks/fixtures.hooks'
import { cn, formatMatchDate, formatKickoff } from '@/lib/utils'
import type { Match, Standing, StandingsResponse } from '@/lib/api/domain'

const GRADIENTS: Record<string, string> = {
  'Premier League':   'from-[#1e0540] via-[#3b1280] to-[#6d28d9]',
  'La Liga':          'from-[#3b0a0a] via-[#7f1d1d] to-[#dc2626]',
  'Serie A':          'from-[#042f2e] via-[#065f46] to-[#10b981]',
  'Bundesliga':       'from-[#2d0a0a] via-[#7f1d1d] to-[#b91c1c]',
  'World Cup':        'from-[#0c1a40] via-[#1e3a8a] to-[#3b82f6]',
  'CAF Champions League': 'from-[#1a2e05] via-[#3f6212] to-[#65a30d]',
}

// ── Standings table ────────────────────────────────────────────────────────────

function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-3 text-left w-8">#</th>
              <th className="px-3 py-3 text-left">Team</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell">W</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell">D</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell">L</th>
              <th className="px-2 py-3 text-center hidden md:table-cell">GF</th>
              <th className="px-2 py-3 text-center hidden md:table-cell">GA</th>
              <th className="px-2 py-3 text-center">GD</th>
              <th className="px-3 py-3 text-center font-black text-foreground">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {standings.map(row => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{row.position}</td>
                <td className="px-3 py-2.5">
                  <Link href={`/teams/${row.team.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    {row.team.logo_url && <img src={row.team.logo_url} alt="" className="h-5 w-5 object-contain" />}
                    <span className="font-medium truncate">{row.team.short_name ?? row.team.name}</span>
                  </Link>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{row.played}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{row.won}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{row.drawn}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{row.lost}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden md:table-cell">{row.goals_for}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden md:table-cell">{row.goals_against}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">
                  {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                </td>
                <td className="px-3 py-2.5 text-center tabular-nums font-black">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Fixture row ────────────────────────────────────────────────────────────────

function FixtureRow({ match }: { match: Match }) {
  const hasScore = match.home_score !== null && match.away_score !== null
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'

  return (
    <Link href={`/matches/${match.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
      <span className="text-[11px] text-muted-foreground w-14 shrink-0">{formatMatchDate(match.kickoff_at)}</span>

      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        <span className="text-[13px] font-semibold text-right truncate">{match.home_team.short_name ?? match.home_team.name}</span>
        {match.home_team.logo_url && <img src={match.home_team.logo_url} alt="" className="h-5 w-5 object-contain shrink-0" />}
      </div>

      <div className="flex flex-col items-center w-14 shrink-0">
        {hasScore ? (
          <span className={cn('text-[14px] font-black tabular-nums', isLive && 'text-live')}>
            {match.home_score}–{match.away_score}
          </span>
        ) : (
          <span className="text-[12px] font-semibold text-muted-foreground">{formatKickoff(match.kickoff_at)}</span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {match.away_team.logo_url && <img src={match.away_team.logo_url} alt="" className="h-5 w-5 object-contain shrink-0" />}
        <span className="text-[13px] font-semibold truncate">{match.away_team.short_name ?? match.away_team.name}</span>
      </div>
    </Link>
  )
}

function FixtureList({ title, matches }: { title: string; matches: Match[] }) {
  if (matches.length === 0) return null
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-[12px] font-black uppercase tracking-wide">{title}</span>
      </div>
      <div className="divide-y divide-border">
        {matches.map(m => <FixtureRow key={m.id} match={m} />)}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type Tab = 'table' | 'fixtures'

export default function CompetitionHubPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<Tab>('table')

  const { data: league, isLoading: leagueLoading } = useLeague(id)

  // Standings — silent so cup competitions (no table) don't fire an error toast
  const { data: standingsData, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings', 'league', id, 'hub'],
    queryFn:  () => api.get<StandingsResponse>(`/standings/league/${id}`, { silent: true }),
    enabled:  !!id,
    retry:    false,
  })

  const { data: upcoming }  = useUpcomingFixtures(id, 10)

  const { data: finished } = useQuery({
    queryKey: ['fixtures', 'league', id, 'finished'],
    queryFn:  () => api.get<Match[]>('/fixtures', { params: { leagueId: id, status: 'FINISHED' } }),
    enabled:  !!id,
  })

  const recent = useMemo(
    () => [...(finished ?? [])].sort((a, b) =>
      new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime()
    ).slice(0, 10),
    [finished],
  )

  const hasStandings = (standingsData?.standings?.length ?? 0) > 0

  // Group-structured competitions (World Cup) → split into per-group tables
  const groups = useMemo(() => {
    const rows = standingsData?.standings ?? []
    if (!rows.some(r => r.group)) return null
    const map = new Map<string, Standing[]>()
    for (const r of rows) {
      const g = r.group ?? 'Group'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(r)
    }
    return Array.from(map.entries())
      .map(([name, rows]) => ({ name, rows: rows.sort((a, b) => a.position - b.position) }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [standingsData])

  const tableLabel = groups ? 'Groups' : 'Table'

  // Default to Fixtures for competitions without a league table (cups)
  useEffect(() => {
    if (!standingsLoading && !hasStandings) setTab('fixtures')
  }, [standingsLoading, hasStandings])

  if (leagueLoading) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 lg:px-6 py-8 space-y-4">
        <div className="h-40 rounded-xl bg-card border border-border animate-pulse" />
        <div className="h-96 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    )
  }

  if (!league) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 lg:px-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">League not found.</p>
        <Link href="/leagues" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          Back to leagues
        </Link>
      </div>
    )
  }

  const gradient = GRADIENTS[league.name] ?? 'from-[#1a1a1a] via-[#2a2a2a] to-[#3a3a3a]'
  const currentSeason = league.seasons?.find(s => s.is_current) ?? league.seasons?.[0]

  return (
    <>
      {/* Banner */}
      <div className={`relative bg-gradient-to-br ${gradient} border-b border-border`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-[1100px] px-4 lg:px-6 py-8">
          <Link href="/leagues" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors mb-5">
            <ArrowLeft className="h-3.5 w-3.5" /> All Leagues
          </Link>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
              {league.logo_url
                ? <img src={league.logo_url} alt={league.name} className="h-11 w-11 object-contain" />
                : <Trophy className="h-8 w-8 text-white/50" />
              }
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wide leading-tight">
                {league.name}
              </h1>
              <p className="text-[13px] text-white/70 mt-1">
                {league.country?.name ?? 'International'}
                {currentSeason && ` · ${currentSeason.year} Season`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1100px] px-4 lg:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {hasStandings && (
            <button
              onClick={() => setTab('table')}
              className={cn(
                'px-5 py-2.5 text-[13px] font-bold transition-colors border-b-2 -mb-px',
                tab === 'table' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tableLabel}
            </button>
          )}
          <button
            onClick={() => setTab('fixtures')}
            className={cn(
              'px-5 py-2.5 text-[13px] font-bold transition-colors border-b-2 -mb-px',
              tab === 'fixtures' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            Fixtures &amp; Results
          </button>
        </div>

        {tab === 'table' && hasStandings && standingsData && (
          groups ? (
            <div className="grid lg:grid-cols-2 gap-5">
              {groups.map(g => (
                <div key={g.name}>
                  <h3 className="text-[12px] font-black uppercase tracking-wide text-muted-foreground mb-2 px-1">{g.name}</h3>
                  <StandingsTable standings={g.rows} />
                </div>
              ))}
            </div>
          ) : (
            <StandingsTable standings={standingsData.standings} />
          )
        )}

        {tab === 'fixtures' && (
          <div className="space-y-5">
            <FixtureList title="Upcoming" matches={upcoming ?? []} />
            <FixtureList title="Recent Results" matches={recent} />
            {(upcoming?.length ?? 0) === 0 && recent.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-[13px] text-muted-foreground">No fixtures available for this competition yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
