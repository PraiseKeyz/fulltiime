'use client'

import { useState, useMemo } from 'react'
import type { Match } from '@/lib/api/domain'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import { useTodayFixtures, useFixture, useUpcomingFixtures } from '@/lib/api/hooks/fixtures.hooks'
import { orderHeroMatches } from './hero/order-hero-matches'
import { MatchSelector } from './hero/match-selector'
import { HeroCard } from './hero/hero-card'
import { HeroNews } from './hero/hero-news'

function HeroSkeleton() {
  return (
    <section className="bg-card border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-4 grid gap-4 lg:grid-cols-[260px_1fr_300px]">
        <div className="hidden lg:block h-[400px] rounded-xl bg-background-secondary border border-border animate-pulse" />
        <div className="h-[400px] rounded-xl bg-background-secondary border border-border animate-pulse" />
        <div className="hidden lg:block h-[400px] rounded-xl bg-background-secondary border border-border animate-pulse" />
      </div>
    </section>
  )
}

export function HeroSection() {
  const { data: leagues } = useLeagues()
  const { data: today, isLoading: todayLoading } = useTodayFixtures()

  // Off-season fallback: when nothing is on today, populate from upcoming fixtures
  const needFallback = !todayLoading && (today?.length ?? 0) === 0
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingFixtures(undefined, 12)

  const pool = (today && today.length > 0) ? today : (upcoming ?? [])

  // Live first, then favorites (none yet), then league hotness — see helper
  const ordered = useMemo(
    () => orderHeroMatches(pool, leagues ?? []),
    [pool, leagues],
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const activeId = selectedId ?? ordered[0]?.id ?? null

  // Rich detail (events for the scorer line) for whichever match is selected.
  // Ignore preview shapes — the hero always shows a real fixture. Written as an
  // `if` (not a ternary) so TS's control-flow analysis actually narrows `detail`
  // to `Match` — a compound `&&`/`!(... in ...)` condition inside a ternary
  // doesn't propagate that narrowing into the consequent expression.
  const { data: detail } = useFixture(activeId ?? '')
  let detailMatch: Match | undefined
  if (detail && !('preview' in detail)) detailMatch = detail
  const activeMatch: Match | undefined =
    detailMatch && detailMatch.id === activeId ? detailMatch : ordered.find(m => m.id === activeId)

  if (todayLoading || (needFallback && upcomingLoading)) return <HeroSkeleton />
  if (!ordered.length || !activeMatch) return null

  return (
    <section className="bg-card border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-4 grid gap-4 lg:grid-cols-[260px_1fr_300px]">
        {/* Col 1 — match selector */}
        <div className="order-2 lg:order-1 lg:h-[400px]">
          <MatchSelector matches={ordered} activeId={activeId} onSelect={setSelectedId} />
        </div>

        {/* Col 2 — main hero card */}
        <div className="order-1 lg:order-2 lg:h-[400px]">
          <HeroCard match={activeMatch} />
        </div>

        {/* Col 3 — latest news */}
        <div className="order-3 lg:h-[400px]">
          <HeroNews />
        </div>
      </div>
    </section>
  )
}
