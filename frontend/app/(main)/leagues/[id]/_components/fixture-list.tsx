import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTimeFormat } from '@/lib/hooks/use-time-format'
import type { Match } from '@/lib/api/domain'

function FixtureRow({ match }: { match: Match }) {
  const { formatMatchDate, formatKickoff } = useTimeFormat()
  const hasScore = match.home_score !== null && match.away_score !== null
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME' || match.status === 'INTERRUPTED'

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

export function FixtureList({ title, matches }: { title: string; matches: Match[] }) {
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
