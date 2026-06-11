import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { League } from '@/lib/api/domain'

export function LeagueSelector({
  leagues, activeLeagueId, onSelect,
}: {
  leagues: League[]
  activeLeagueId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
      {leagues.map((league) => (
        <Button
          key={league.id}
          onClick={() => onSelect(league.id)}
          variant={activeLeagueId === league.id ? 'primary' : 'secondary'}
          size="sm"
          className={cn('shrink-0 gap-2 rounded-full px-4 text-sm', activeLeagueId !== league.id && 'text-muted-foreground')}
        >
          {league.logo_url && (
            <img src={league.logo_url} alt="" className="h-4 w-4 object-contain" />
          )}
          {league.short_name ?? league.name}
        </Button>
      ))}
    </div>
  )
}
