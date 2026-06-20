'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useFixture } from '@/lib/api/hooks/fixtures.hooks'
import { useImmersive } from '@/providers/immersive-provider'
import { getMatchPhase } from './_components/phase'
import { MatchHero } from './_components/match-hero'
import { MatchTabBar, MatchTabPanel } from './_components/match-tabs'
import { MatchRail } from './_components/match-rail'

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useFixture(id)
  const { immersive } = useImmersive()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6 space-y-4">
        <div className="h-48 rounded-xl bg-card border border-border animate-pulse" />
        <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-20 text-center">
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
    <div
      className={cn(
        'mx-auto max-w-[1400px] px-4 lg:px-6 grid gap-6',
        immersive ? 'py-0 lg:grid-cols-1' : 'py-6 lg:grid-cols-[1fr_320px]',
      )}
    >
      {/* Main */}
      <div className={cn('min-w-0 space-y-6', immersive && 'flex flex-col h-screen')}>
        <div
          className={cn(
            'sticky z-30 bg-background space-y-4 pb-4',
            // Navbar is gone entirely while immersive (see Navbar), so there's no
            // header height left to clear — stick straight to the viewport top.
            immersive ? 'top-0' : 'top-[68px]',
          )}
        >
          <MatchHero view={view} />
          <Suspense fallback={null}>
            <MatchTabBar view={view} />
          </Suspense>
        </div>
        {/* While immersive this flexes to fill the rest of the viewport, so the
            chat (and its input) fills real space instead of floating in a fixed
            height with empty page below it. Otherwise it's just normal flow. */}
        <div className={cn(immersive && 'flex-1 min-h-0')}>
          <Suspense fallback={<div className="h-64 rounded-xl bg-card border border-border animate-pulse" />}>
            <MatchTabPanel view={view} />
          </Suspense>
        </div>
      </div>

      {/* Rail */}
      <MatchRail view={view} />
    </div>
  )
}
