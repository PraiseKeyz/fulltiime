import Link from 'next/link'
import { ArrowLeft, User, Flag, Calendar, Hash } from 'lucide-react'
import type { Player } from '@/lib/api/domain'
import { POSITION_LABEL } from '@/app/(main)/teams/[id]/_components/constants'

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const hasHadBirthdayThisYear =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate())
  if (!hasHadBirthdayThisYear) age -= 1
  return age
}

export function PlayerBanner({ player }: { player: Player }) {
  return (
    <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] border-b border-border">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-8">
        <Link
          href={player.team ? `/teams/${player.team.id}` : '/teams'}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {player.team ? player.team.name : 'All Teams'}
        </Link>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {player.photo_url
              ? <img src={player.photo_url} alt={player.name} className="h-full w-full object-cover" />
              : <User className="h-8 w-8 text-white/50" />
            }
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wide leading-tight">
              {player.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/70 mt-1.5">
              {player.position && (
                <span className="inline-flex items-center gap-1.5">
                  {POSITION_LABEL[player.position].replace(/s$/, '')}
                </span>
              )}
              {player.number != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> {player.number}
                </span>
              )}
              {player.nationality && (
                <span className="inline-flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5" /> {player.nationality}
                </span>
              )}
              {player.date_of_birth && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {calculateAge(player.date_of_birth)} years old
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
