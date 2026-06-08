'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useFixture } from '@/lib/api/hooks/fixtures.hooks'
import { getMatchPhase } from './_components/phase'
import { MatchHero } from './_components/match-hero'
import { MatchTabs } from './_components/match-tabs'
import { MatchRail } from './_components/match-rail'

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useFixture(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 lg:px-6 py-6 space-y-4">
        <div className="h-48 rounded-xl bg-card border border-border animate-pulse" />
        <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 lg:px-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">Match not found.</p>
        <Link href="/matches" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          Back to matches
        </Link>
      </div>
    )
  }

  // One decision drives the whole page — see docs/match-page-spec.md.
  const view = getMatchPhase(data)

  return (
    <div className="mx-auto max-w-[1100px] px-4 lg:px-6 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Main */}
      <div className="min-w-0 space-y-6">
        <MatchHero view={view} />
        <Suspense fallback={<div className="h-64 rounded-xl bg-card border border-border animate-pulse" />}>
          <MatchTabs view={view} />
        </Suspense>
      </div>

      {/* Rail */}
      <MatchRail view={view} />
    </div>
  )
}
