'use client'

import { useState } from 'react'
import { useFixtures } from '@/lib/api/hooks/fixtures.hooks'
import { MatchCard } from '@/components/fixtures/match-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
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
    <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8">
      <h1 className="text-2xl font-black mb-6">Fixtures</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.label}
            onClick={() => setStatus(f.value)}
            variant={status === f.value ? 'primary' : 'secondary'}
            size="sm"
            className={cn('shrink-0 rounded-full px-4 text-sm', status !== f.value && 'text-muted-foreground')}
          >
            {f.label}
          </Button>
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
