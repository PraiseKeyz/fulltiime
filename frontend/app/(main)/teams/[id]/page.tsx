'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTeam, useTeamFixtures } from '@/lib/api/hooks/teams.hooks'
import { TeamBanner } from './_components/team-banner'
import { SquadList } from './_components/squad-list'
import { RecentFixtures } from './_components/recent-fixtures'
import { POSITION_ORDER } from './_components/constants'

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
      <TeamBanner team={team} />

      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[12px] font-black uppercase tracking-wide text-muted-foreground">Squad</h2>
          <SquadList squadByPosition={squadByPosition} />
        </div>

        <RecentFixtures fixtures={fixtures} />
      </div>
    </>
  )
}
