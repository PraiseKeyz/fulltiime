'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePlayer } from '@/lib/api/hooks/players.hooks'
import { PlayerBanner } from './_components/player-banner'

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const { data: player, isLoading } = usePlayer(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-8 space-y-4">
        <div className="h-40 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    )
  }

  if (!player) {
    return (
      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">Player not found.</p>
        <Link href="/teams" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          Back to teams
        </Link>
      </div>
    )
  }

  return (
    <>
      <PlayerBanner player={player} />

      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-6">
        <div className="rounded-xl border border-border bg-card divide-y divide-border max-w-md">
          {player.team && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[12px] text-muted-foreground">Club</span>
              <Link href={`/teams/${player.team.id}`} className="flex items-center gap-2 text-[13px] font-semibold hover:text-primary">
                {player.team.logo_url && (
                  <img src={player.team.logo_url} alt="" className="h-5 w-5 object-contain" />
                )}
                {player.team.name}
              </Link>
            </div>
          )}
          {player.nationality && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[12px] text-muted-foreground">Nationality</span>
              <span className="text-[13px] font-semibold">{player.nationality}</span>
            </div>
          )}
          {player.date_of_birth && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[12px] text-muted-foreground">Date of birth</span>
              <span className="text-[13px] font-semibold">
                {new Date(player.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
          {player.number != null && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[12px] text-muted-foreground">Shirt number</span>
              <span className="text-[13px] font-semibold">{player.number}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
