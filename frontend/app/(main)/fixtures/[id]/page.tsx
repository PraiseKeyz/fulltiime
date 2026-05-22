'use client'

import { useParams } from 'next/navigation'
import { useFixture } from '@/lib/api/hooks/fixtures.hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatMatchDate, formatKickoff } from '@/lib/utils'

export default function FixtureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: match, isLoading } = useFixture(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (!match) return <p className="text-muted-foreground">Match not found.</p>

  const hasScore = match.home_score !== null && match.away_score !== null
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Match header */}
      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          {match.season?.league?.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatMatchDate(match.kickoff_at)} · {formatKickoff(match.kickoff_at)}
        </p>

        <div className="flex items-center justify-center gap-8">
          {/* Home */}
          <div className="flex flex-col items-center gap-2 w-28">
            {match.home_team.logo_url && (
              <img src={match.home_team.logo_url} alt="" className="h-14 w-14 object-contain" />
            )}
            <span className="text-sm font-semibold text-center leading-tight">{match.home_team.name}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1">
            {hasScore ? (
              <span className={cn('text-4xl font-black tabular-nums', isLive && 'text-red-400')}>
                {match.home_score} – {match.away_score}
              </span>
            ) : (
              <span className="text-2xl font-black text-muted-foreground">vs</span>
            )}
            <span className={cn(
              'text-xs font-bold px-2 py-0.5 rounded',
              isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground',
            )}>
              {match.status === 'LIVE' && match.minute ? `${match.minute}'` : match.status}
            </span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2 w-28">
            {match.away_team.logo_url && (
              <img src={match.away_team.logo_url} alt="" className="h-14 w-14 object-contain" />
            )}
            <span className="text-sm font-semibold text-center leading-tight">{match.away_team.name}</span>
          </div>
        </div>

        {match.venue && (
          <p className="text-xs text-muted-foreground">{match.venue}</p>
        )}
      </div>

      {/* Match events */}
      {match.events && match.events.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Match Events</h2>
          <div className="space-y-2">
            {match.events.map((event) => (
              <div key={event.id} className="flex items-center gap-3 text-sm">
                <span className="w-8 text-right font-mono text-xs text-muted-foreground shrink-0">
                  {event.minute}&apos;
                </span>
                <span className="text-muted-foreground text-xs">{event.type}</span>
                <span className="font-medium">{event.player_name}</span>
                {event.detail && (
                  <span className="text-muted-foreground text-xs">({event.detail})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
