import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
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
              <button
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                className={cn(
                  'px-5 py-1.5 rounded-full text-[12px] font-bold transition-colors border',
                  filter === f.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground border-border hover:text-foreground',
                )}
              >
                {f.value === 'LIVE' && liveCount > 0 ? `Live (${liveCount})` : f.label}
              </button>
            ))}
          </div>

          {/* Date navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDayChange(dayOffset - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[13px] font-bold min-w-[80px] text-center">
              {formatDateLabel(dayOffset)}
            </span>
            <button
              onClick={() => onDayChange(dayOffset + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
