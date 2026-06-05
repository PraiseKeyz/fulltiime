import { MatchRow } from './match-row'
import type { LeagueGroup } from './types'

export function LeagueSection({ group }: { group: LeagueGroup }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* League header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
        {group.leagueLogo ? (
          <img src={group.leagueLogo} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <div className="h-5 w-5 rounded-full bg-muted" />
        )}
        <span className="text-[12px] font-black uppercase tracking-wide">{group.leagueName}</span>
        <span className="ml-auto text-[11px] text-muted-foreground">{group.matches.length} matches</span>
      </div>

      {/* Matches */}
      <div className="divide-y divide-border">
        {group.matches.map(m => <MatchRow key={m.id} match={m} />)}
      </div>
    </div>
  )
}
