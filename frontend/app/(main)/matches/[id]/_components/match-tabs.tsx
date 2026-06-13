'use client'

import { useMemo, useEffect, useCallback, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { MatchView } from './phase'
import { getPhasePlan } from './phase.config'

// ─── Tab engine ──────────────────────────────────────────────────────────────
//
// Renders the tab bar + active tab for the current phase. The tab SET is
// data-driven (getPhasePlan), the active tab is synced to ?tab= so a reload keeps
// it, and an invalid/now-missing tab falls back to the phase default.

export function MatchTabs({ view }: { view: MatchView }) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const plan = useMemo(() => getPhasePlan(view), [view])

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

  const current = plan.tabs.find(t => t.key === active) ?? plan.tabs[0]

  // A single tab (e.g. a cancelled game with only the narrative) needs no tab bar.
  const showBar = plan.tabs.length > 1

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
  }, [updateEdges, plan.tabs.length, active])

  return (
    <div>
      {showBar && (
        <div className="relative mb-6">
          <div
            ref={scrollRef}
            onScroll={updateEdges}
            className="flex gap-1 border-b border-border overflow-x-auto scrollbar-none"
          >
            {plan.tabs.map(t => (
              <Button
                key={t.key}
                onClick={() => selectTab(t.key)}
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
      )}

      {current?.render()}
    </div>
  )
}
