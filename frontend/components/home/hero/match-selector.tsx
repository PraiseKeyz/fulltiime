'use client'

import { cn, formatKickoff } from '@/lib/utils'
import type { Match } from '@/lib/api/domain'

function StatusTag({ match }: { match: Match }) {
  if (match.status === 'LIVE') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-black text-live">
        <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
        {match.minute ? `${match.minute}'` : 'LIVE'}
      </span>
    )
  }
  if (match.status === 'HALFTIME') return <span className="text-[10px] font-black text-orange-400">HT</span>
  if (match.status === 'FINISHED')  return <span className="text-[10px] font-semibold text-muted-foreground">FT</span>
  if (match.status === 'SCHEDULED') return <span className="text-[10px] font-semibold text-muted-foreground">{formatKickoff(match.kickoff_at)}</span>
  return null
}

function Side({ name, logo, score, dim }: { name: string; logo: string | null; score: number | null; dim?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        {logo
          ? <img src={logo} alt="" className="h-4 w-4 object-contain shrink-0" />
          : <div className="h-4 w-4 rounded-full bg-muted shrink-0" />
        }
        <span className={cn('text-[12px] font-semibold truncate', dim && 'text-muted-foreground')}>{name}</span>
      </div>
      {score !== null && (
        <span className={cn('text-[12px] font-black tabular-nums shrink-0', dim && 'text-muted-foreground')}>{score}</span>
      )}
    </div>
  )
}

function SelectorRow({ match, active, onSelect }: { match: Match; active: boolean; onSelect: () => void }) {
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME'
  const homeWins = (match.home_score ?? 0) < (match.away_score ?? 0)
  const awayWins = (match.away_score ?? 0) < (match.home_score ?? 0)

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left px-3 py-2.5 border-l-2 transition-colors',
        active
          ? 'border-primary bg-primary/[0.06]'
          : 'border-transparent hover:bg-muted/50',
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {match.season?.league?.logo_url && (
            <img src={match.season.league.logo_url} alt="" className="h-3 w-3 object-contain shrink-0" />
          )}
          <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground truncate">
            {match.season?.league?.name}
          </span>
        </div>
        <StatusTag match={match} />
      </div>
      <div className="space-y-0.5">
        <Side name={match.home_team.short_name ?? match.home_team.name} logo={match.home_team.logo_url} score={match.home_score} dim={match.status === 'FINISHED' && homeWins} />
        <Side name={match.away_team.short_name ?? match.away_team.name} logo={match.away_team.logo_url} score={match.away_score} dim={match.status === 'FINISHED' && awayWins} />
      </div>
    </button>
  )
}

export function MatchSelector({
  matches, activeId, onSelect,
}: {
  matches: Match[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-border shrink-0">
        <h3 className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">Matches</h3>
      </div>
      <div className="flex-1 divide-y divide-border/60 overflow-y-auto scrollbar-none max-h-[360px] lg:max-h-none">
        {matches.map(m => (
          <SelectorRow key={m.id} match={m} active={m.id === activeId} onSelect={() => onSelect(m.id)} />
        ))}
      </div>
    </div>
  )
}
