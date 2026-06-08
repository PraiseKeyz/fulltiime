'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, MapPin, Calendar, Flag } from 'lucide-react'
import { useTeam, useTeamFixtures } from '@/lib/api/hooks/teams.hooks'
import { MatchCard } from '@/components/fixtures/match-card'
import type { PlayerPosition } from '@/lib/api/domain'

const POSITION_ORDER: PlayerPosition[] = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']
const POSITION_LABEL: Record<PlayerPosition, string> = {
  GOALKEEPER: 'Goalkeepers',
  DEFENDER:   'Defenders',
  MIDFIELDER: 'Midfielders',
  FORWARD:    'Forwards',
}

export default function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const { data: team, isLoading } = useTeam(id)
  const { data: fixtures } = useTeamFixtures(id, 6)

  const squadByPosition = useMemo(() => {
    const players = team?.players ?? []
    return POSITION_ORDER
      .map((position) => ({ position, players: players.filter((p) => p.position === position) }))
      .filter((group) => group.players.length > 0)
  }, [team])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8 space-y-4">
        <div className="h-40 rounded-xl bg-card border border-border animate-pulse" />
        <div className="h-96 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">Team not found.</p>
        <Link href="/teams" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          Back to teams
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Banner */}
      <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] border-b border-border">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-[1400px] px-4 lg:px-6 py-8">
          <Link href="/teams" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors mb-5">
            <ArrowLeft className="h-3.5 w-3.5" /> All Teams
          </Link>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
              {team.logo_url
                ? <img src={team.logo_url} alt={team.name} className="h-11 w-11 object-contain" />
                : <Shield className="h-8 w-8 text-white/50" />
              }
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wide leading-tight">
                {team.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/70 mt-1.5">
                {team.country && (
                  <span className="inline-flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5" /> {team.country.name}
                  </span>
                )}
                {team.founded && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Est. {team.founded}
                  </span>
                )}
                {team.stadium && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {team.stadium}
                    {team.venue_city && `, ${team.venue_city}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[12px] font-black uppercase tracking-wide text-muted-foreground">Squad</h2>
          {squadByPosition.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-[13px] text-muted-foreground">No squad information available yet.</p>
            </div>
          ) : (
            squadByPosition.map(({ position, players }) => (
              <div key={position} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <span className="text-[12px] font-black uppercase tracking-wide">{POSITION_LABEL[position]}</span>
                </div>
                <div className="divide-y divide-border">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="w-6 text-center text-[12px] font-mono tabular-nums text-muted-foreground shrink-0">
                        {player.number ?? '—'}
                      </span>
                      {player.photo_url ? (
                        <img src={player.photo_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                      )}
                      <span className="text-[13px] font-semibold truncate">{player.name}</span>
                      {player.nationality && (
                        <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{player.nationality}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent fixtures */}
        <div className="space-y-3">
          <h2 className="text-[12px] font-black uppercase tracking-wide text-muted-foreground">Recent Fixtures</h2>
          {fixtures && fixtures.length > 0 ? (
            fixtures.map((match) => <MatchCard key={match.id} match={match} />)
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-[13px] text-muted-foreground">No fixtures available.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
