import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FILTERS, type Filter } from './types'
import { formatDateLabel } from './utils'

export function MatchesHeader({
  liveCount, filter, onFilterChange, dayOffset, onDayChange,
}: {
  liveCount: number
  filter: Filter
  onFilterChange: (f: Filter) => void
  dayOffset: number
  onDayChange: (next: number) => void
}) {
  return (
    <div className="bg-card border-b border-border py-6">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-black">Matches</h1>
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-live/20 border border-live/40 px-3 py-1 text-[11px] font-black text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
              {liveCount} LIVE
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-5 gap-4 flex-wrap">
          {/* Filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(f => (
              <Button
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                variant={filter === f.value ? 'primary' : 'outline'}
                size="sm"
                className={cn('rounded-full px-5 text-[12px]', filter !== f.value && 'text-muted-foreground')}
              >
                {f.value === 'LIVE' && liveCount > 0 ? `Live (${liveCount})` : f.label}
              </Button>
            ))}
          </div>

          {/* Date navigator */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous day"
              onClick={() => onDayChange(dayOffset - 1)}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft />
            </Button>
            <span className="text-[13px] font-bold min-w-[80px] text-center">
              {formatDateLabel(dayOffset)}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next day"
              onClick={() => onDayChange(dayOffset + 1)}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
