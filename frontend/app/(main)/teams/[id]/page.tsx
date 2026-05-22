'use client'

import { useParams } from 'next/navigation'
import { useTeam, useTeamFixtures } from '@/lib/api/hooks/teams.hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionHeader } from '@/components/ui/section-header'
import { MatchCard } from '@/components/fixtures/match-card'

const POSITION_ORDER = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']

export default function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const { data: team, isLoading } = useTeam(id)
  const { data: fixtures } = useTeamFixtures(id, 5)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!team) return <p className="text-muted-foreground">Team not found.</p>

  const playersByPosition = (team as any).players
    ? POSITION_ORDER.map((pos) => ({
        position: pos,
        players: ((team as any).players as any[]).filter((p) => p.position === pos),
      })).filter((g) => g.players.length > 0)
    : []

  return (
    <div className="space-y-8">
      {/* Team header */}
      <div className="flex items-center gap-6 rounded-xl border border-border bg-card p-6">
        {team.logo_url && (
          <img src={team.logo_url} alt={team.name} className="h-20 w-20 object-contain shrink-0" />
        )}
        <div>
          <h1 className="text-2xl font-black">{team.name}</h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {team.country && <span>{team.country.name}</span>}
            {team.founded && <span>Est. {team.founded}</span>}
            {team.stadium && <span>{team.stadium}</span>}
            {team.venue_city && <span>{team.venue_city}</span>}
          </div>
        </div>
      </div>

      {/* Recent fixtures */}
      {fixtures && fixtures.length > 0 && (
        <section>
          <SectionHeader title="Recent Fixtures" href={`/fixtures?teamId=${id}`} />
          <div className="space-y-3">
            {fixtures.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Squad */}
      {playersByPosition.length > 0 && (
        <section>
          <SectionHeader title="Squad" />
          {playersByPosition.map(({ position, players }) => (
            <div key={position} className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {position}S
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {players.map((player: any) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <span className="w-6 text-center text-xs font-mono text-muted-foreground">
                      {player.number ?? '—'}
                    </span>
                    {player.photo_url && (
                      <img src={player.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    )}
                    <span className="text-sm font-medium">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
