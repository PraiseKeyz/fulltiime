'use client'

import { useMemo } from 'react'
import type { Match } from '@/lib/api/domain'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import { useTodayFixtures, useFixture, useUpcomingFixtures } from '@/lib/api/hooks/fixtures.hooks'
import { orderHeroMatches } from './hero/order-hero-matches'
import { LeaguesPanel } from './hero/leagues-panel'
import { HeroCard } from './hero/hero-card'
import { HeroNews } from './hero/hero-news'

function HeroSkeleton() {
  return (
    <section className="">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-4 grid gap-4 lg:grid-cols-[280px_1fr_280px]">
        <div className="hidden lg:block h-[400px] rounded-xl bg-background-secondary border border-border animate-pulse" />
        <div className="h-[400px] rounded-xl bg-background-secondary border border-border animate-pulse" />
        <div className="hidden lg:block h-[400px] rounded-xl bg-background-secondary border border-border animate-pulse" />
      </div>
    </section>
  )
}

export function HeroSection() {
  const { data: leagues } = useLeagues()
  const { data: today, isLoading: todayLoading, isError: todayError } = useTodayFixtures()

  // Fall back to upcoming ONLY when today genuinely returned no games (off-season).
  // NEVER on a failed/empty-because-errored load — otherwise a flaky connection
  // swaps the live match for a non-live "vs" placeholder (looks like a TBD).
  const todayEmpty = !todayLoading && !todayError && (today?.length ?? 0) === 0
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingFixtures(undefined, 12)

  const pool = (today && today.length > 0) ? today : (todayEmpty ? (upcoming ?? []) : (today ?? []))

  // Live first, then favorites (none yet), then league hotness — see helper
  const ordered = useMemo(
    () => orderHeroMatches(pool, leagues ?? []),
    [pool, leagues],
  )

  // Fully automatic — always feature the highest-priority match.
  const activeId = ordered[0]?.id ?? null

  const { data: detail } = useFixture(activeId ?? '')
  let detailMatch: Match | undefined
  if (detail && !('preview' in detail)) detailMatch = detail
  const activeMatch: Match | undefined =
    detailMatch && detailMatch.id === activeId ? detailMatch : ordered.find(m => m.id === activeId)

  if (todayLoading || (todayEmpty && upcomingLoading)) return <HeroSkeleton />
  if (!ordered.length || !activeMatch) return null

  return (
    <section className="">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 grid gap-4 lg:grid-cols-[280px_1fr_280px]">
        {/* Col 1 — leagues navigator */}
        <div className="order-2 lg:order-1 lg:h-[400px]">
          <LeaguesPanel />
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
