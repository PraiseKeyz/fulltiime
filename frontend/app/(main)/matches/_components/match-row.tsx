'use client'

import Link from 'next/link'
import { Clock, ChevronRight } from 'lucide-react'
import { cn, formatMinute } from '@/lib/utils'
import { useTimeFormat } from '@/lib/hooks/use-time-format'
import { useLiveClock } from '@/lib/hooks/use-live-clock'
import type { Match } from '@/lib/api/domain'

function StatusBadge({ match }: { match: Match }) {
  const { formatKickoff } = useTimeFormat()
  const clock = useLiveClock(match)
  const { status, kickoff_at } = match
  if (status === 'LIVE') return (
    <span className="flex items-center gap-1 text-[11px] font-black">
      <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
      {clock.minute != null
        ? <span className="text-foreground">{formatMinute(clock.minute, clock.extraMinute, clock.seconds)}</span>
        : <span className="text-live">LIVE</span>
      }
    </span>
  )
  if (status === 'HALFTIME') return <span className="text-[11px] font-black text-primary">HT</span>
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

export function MatchRow({ match }: { match: Match }) {
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
