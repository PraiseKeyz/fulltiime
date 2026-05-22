import Link from 'next/link'
import { cn, formatKickoff } from '@/lib/utils'
import type { Match } from '@/lib/api/domain'

interface MatchCardProps {
  match: Match
  className?: string
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  LIVE: { label: 'LIVE', className: 'bg-red-500 text-white animate-pulse' },
  HALFTIME: { label: 'HT', className: 'bg-orange-500 text-white' },
  FINISHED: { label: 'FT', className: 'bg-muted text-muted-foreground' },
  SCHEDULED: { label: '', className: '' },
  POSTPONED: { label: 'PPD', className: 'bg-muted text-muted-foreground' },
  CANCELLED: { label: 'CANC', className: 'bg-destructive text-white' },
}

export function MatchCard({ match, className }: MatchCardProps) {
  const badge = STATUS_BADGE[match.status] ?? STATUS_BADGE.SCHEDULED
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'
  const hasScore = match.home_score !== null && match.away_score !== null

  return (
    <Link
      href={`/fixtures/${match.id}`}
      className={cn(
        'block rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors',
        isLive && 'border-red-500/30',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          <span className="truncate text-sm font-semibold">{match.home_team.name}</span>
          {match.home_team.logo_url && (
            <img src={match.home_team.logo_url} alt="" className="h-6 w-6 object-contain shrink-0" />
          )}
        </div>

        {/* Score / time */}
        <div className="flex flex-col items-center gap-0.5 w-20 shrink-0">
          {hasScore ? (
            <span className={cn('text-lg font-bold tabular-nums', isLive && 'text-red-400')}>
              {match.home_score} – {match.away_score}
            </span>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">
              {formatKickoff(match.kickoff_at)}
            </span>
          )}
          {badge.label && (
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', badge.className)}>
              {match.status === 'LIVE' && match.minute ? `${match.minute}'` : badge.label}
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          {match.away_team.logo_url && (
            <img src={match.away_team.logo_url} alt="" className="h-6 w-6 object-contain shrink-0" />
          )}
          <span className="truncate text-sm font-semibold">{match.away_team.name}</span>
        </div>
      </div>

      {/* League label */}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {match.season?.league?.name}
      </p>
    </Link>
  )
}
