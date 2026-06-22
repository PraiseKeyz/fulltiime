'use client'

import { useMemo, useEffect, useCallback, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useImmersive } from '@/providers/immersive-provider'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import type { MatchView } from './phase'
import { getPhasePlan, type PhaseTab } from './phase.config'

// ─── Shared tab state ────────────────────────────────────────────────────────
//
// The active tab is derived purely from (view, ?tab=) — no internal state —
// so the bar and the panel below can each call this independently and never
// desync. Split into two components (bar vs panel) so the bar can live inside
// the sticky hero block while the panel scrolls underneath it (see page.tsx).

function useTabState(view: MatchView) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()
  const isDesktop    = useMediaQuery('(min-width: 1024px)')

  const plan = useMemo(() => getPhasePlan(view, isDesktop), [view, isDesktop])

  const urlTab = searchParams.get('tab')
  const active = plan.tabs.some(t => t.key === urlTab) ? urlTab! : plan.defaultTab

  // If the URL points at a tab this phase doesn't have (e.g. ?tab=stats on an
  // upcoming game), normalise the URL to the resolved tab.
  useEffect(() => {
    if (urlTab && urlTab !== active) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', active)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [urlTab, active, searchParams, router, pathname])

  const selectTab = useCallback((key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', key)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  return { plan, active, selectTab }
}

// ─── Scrollable row of tab buttons (shared by the flat bar and the umbrella's
// expanded sub-row) ───────────────────────────────────────────────────────────

function TabStrip({
  tabs, active, onSelect,
}: {
  tabs: PhaseTab[]
  active: string
  onSelect: (key: string) => void
}) {
  // Edge fades tell the user the tab strip scrolls when tabs overflow: a fade
  // appears on the right while there's more off-screen, and on the left once
  // they've scrolled. Recomputed on scroll and whenever the width/tab set changes.
  const scrollRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const updateEdges = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const left  = el.scrollLeft > 1
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setEdges(prev => (prev.left === left && prev.right === right ? prev : { left, right }))
  }, [])

  useEffect(() => {
    updateEdges()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateEdges)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateEdges, tabs.length, active])

  return (
    <div className="relative bg-background">
      <div
        ref={scrollRef}
        onScroll={updateEdges}
        className="flex gap-1 border-b border-border overflow-x-auto scrollbar-none"
      >
        {tabs.map(t => (
          <Button
            key={t.key}
            onClick={() => onSelect(t.key)}
            variant="ghost"
            className={cn(
              'h-auto shrink-0 rounded-none border-b-2 -mb-px px-4 sm:px-5 py-2.5 text-[13px] hover:bg-transparent',
              t.key === active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Scroll affordances — only shown when there's hidden content that way. */}
      {edges.left && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
      )}
      {edges.right && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end bg-gradient-to-l from-background via-background/80 to-transparent w-12 pr-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────
//
// When Fullchat is one of the tabs, the bar collapses to two pills — "Fullchat"
// and "Overview" — so the chat experience isn't competing visually with half a
// dozen other tab labels. "Overview" is an umbrella: tapping it expands every
// other tab (Summary, Commentary, Line-ups, Stats, the narrative Overview, H2H,
// Ask) into a sub-row beneath it, landing on Summary by default. Without a
// Fullchat tab in the plan (flag off, or a phase that doesn't carry one), the
// bar renders exactly as before — flat, no umbrella.

export function MatchTabBar({ view }: { view: MatchView }) {
  const { plan, active, selectTab } = useTabState(view)
  const { setImmersive } = useImmersive()

  // Fullchat hiding the rail/footer is declared here, not guessed from the URL
  // elsewhere — this is the one place that already knows the resolved active
  // tab. Reset on cleanup so navigating away (or switching tabs) never leaves
  // another page's footer/rail suppressed.
  useEffect(() => {
    setImmersive(active === 'banter')
    return () => setImmersive(false)
  }, [active, setImmersive])

  // A single tab (e.g. a cancelled game with only the narrative) needs no tab bar.
  if (plan.tabs.length <= 1) return null

  const banterTab = plan.tabs.find(t => t.key === 'banter')
  const otherTabs = plan.tabs.filter(t => t.key !== 'banter')

  if (!banterTab || otherTabs.length === 0) {
    return <TabStrip tabs={plan.tabs} active={active} onSelect={selectTab} />
  }

  const expanded = active !== 'banter'

  return (
    <div className="bg-background">
      <div className="flex gap-1 border-b border-border">
        <Button
          onClick={() => selectTab('banter')}
          variant="ghost"
          className={cn(
            'h-auto shrink-0 rounded-none border-b-2 -mb-px px-4 sm:px-5 py-2.5 text-[13px] font-bold hover:bg-transparent',
            !expanded ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {banterTab.label}
        </Button>
        <Button
          onClick={() => { if (!expanded) selectTab(otherTabs[0].key) }}
          variant="ghost"
          className={cn(
            'h-auto shrink-0 rounded-none border-b-2 -mb-px px-4 sm:px-5 py-2.5 text-[13px] font-bold hover:bg-transparent',
            expanded ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          Overview
        </Button>
      </div>

      {/* Collapses/expands the full sub-tab row smoothly via the CSS grid-rows
          trick — animates from 0fr to 1fr, which (unlike max-height) handles an
          intrinsically-sized child correctly with no magic numbers. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <TabStrip tabs={otherTabs} active={active} onSelect={selectTab} />
        </div>
      </div>
    </div>
  )
}

// ─── Tab panel ───────────────────────────────────────────────────────────────

export function MatchTabPanel({ view }: { view: MatchView }) {
  const { plan, active } = useTabState(view)
  const current = plan.tabs.find(t => t.key === active) ?? plan.tabs[0]
  return <>{current?.render()}</>
}
