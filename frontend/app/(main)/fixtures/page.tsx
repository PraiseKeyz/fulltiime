'use client'

import { useState } from 'react'
import { useFixtures } from '@/lib/api/hooks/fixtures.hooks'
import { MatchCard } from '@/components/fixtures/match-card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { MatchStatus } from '@/lib/api/domain'

const STATUS_FILTERS: { label: string; value: MatchStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Live', value: 'LIVE' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Finished', value: 'FINISHED' },
]

export default function FixturesPage() {
  const [status, setStatus] = useState<MatchStatus | undefined>(undefined)
  const { data: matches, isLoading } = useFixtures({ status })

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Fixtures</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              status === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !matches?.length ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No fixtures found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}
