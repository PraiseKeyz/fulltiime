import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { League } from '@/lib/api/domain'

function LeagueRailButton({
  active, logo, name, subtitle, count, onClick,
}: {
  active: boolean
  logo: React.ReactNode
  name: string
  subtitle?: string
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
        active ? 'bg-primary/10' : 'hover:bg-muted/50',
      )}
    >
      <div className="h-7 w-7 shrink-0 flex items-center justify-center">{logo}</div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-[12px] font-bold truncate', active ? 'text-primary' : 'text-foreground')}>{name}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {count != null && count > 0 && (
        <span className={cn(
          'text-[11px] font-black tabular-nums shrink-0',
          active ? 'text-primary' : 'text-muted-foreground',
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

export function TopLeaguesRail({
  leagues, counts, totalCount, selectedId, onSelect,
}: {
  leagues: League[]
  counts: Map<string, number>
  totalCount: number
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[72px] rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wide">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Top Leagues
          </h2>
        </div>
        <div className="py-1 divide-y divide-border/50 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-none">
          <LeagueRailButton
            active={selectedId === null}
            logo={<Trophy className="h-4 w-4 text-muted-foreground" />}
            name="All Matches"
            count={totalCount}
            onClick={() => onSelect(null)}
          />
          {leagues.map(l => (
            <LeagueRailButton
              key={l.id}
              active={selectedId === l.id}
              logo={
                l.logo_url
                  ? <img src={l.logo_url} alt="" className="h-6 w-6 object-contain" />
                  : <Trophy className="h-4 w-4 text-muted-foreground" />
              }
              name={l.short_name ?? l.name}
              subtitle={l.country?.name ?? 'International'}
              count={counts.get(l.id)}
              onClick={() => onSelect(l.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
