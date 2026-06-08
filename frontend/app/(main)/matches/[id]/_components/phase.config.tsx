import type { ReactNode } from 'react'
import type { Match } from '@/lib/api/domain'
import type { MatchView } from './phase'
import { getNarrative } from './match-narrative'
import {
  SummaryTab, LineupsTab, StatsTab, NarrativeTab, availableStatRows,
} from './match-tab-content'

// ─── Phase plan ──────────────────────────────────────────────────────────────
//
// Given a match view, decide WHICH tabs render, in what ORDER, and which is the
// DEFAULT. This is the declarative heart of the page (see docs/match-page-spec.md
// §5): a tab only appears when its data exists, so empty boxes never show and the
// narrative is the default for "quiet" phases but demoted behind Summary for live
// and finished games.
//
// Expressed as a function (not a static map) so each case is fully type-narrowed
// on the concrete Match/Preview — but it still reads as one block per phase.

export interface PhaseTab {
  key:    string
  label:  string
  render: () => ReactNode
}

export interface PhasePlan {
  tabs:       PhaseTab[]
  defaultTab: string
}

const hasLineups = (m: Match) => (m.lineups?.length ?? 0) > 0
const hasStats   = (m: Match) => availableStatRows(m).length > 0

function narrativeTab(view: MatchView): PhaseTab {
  return {
    key:    'narrative',
    label:  getNarrative(view).label,
    render: () => <NarrativeTab view={view} />,
  }
}

export function getPhasePlan(view: MatchView): PhasePlan {
  switch (view.phase) {
    // Quiet phases — narrative carries the page, it's the only/default tab.
    case 'tbd':
    case 'postponed':
    case 'cancelled':
      return { tabs: [narrativeTab(view)], defaultTab: 'narrative' }

    // Upcoming — preview first; line-ups appear once confirmed (~1h pre-match).
    case 'upcoming': {
      const m = view.match
      const tabs: PhaseTab[] = [narrativeTab(view)]
      if (hasLineups(m)) {
        tabs.push({ key: 'lineups', label: 'Line-ups', render: () => <LineupsTab match={m} /> })
      }
      return { tabs, defaultTab: 'narrative' }
    }

    // Busy phases — Summary is default; data-rich tabs appear when present; the
    // narrative ("Preview"/"Report") is demoted to the end.
    case 'live':
    case 'finished': {
      const m = view.match
      const tabs: PhaseTab[] = [
        { key: 'summary', label: 'Summary', render: () => <SummaryTab match={m} /> },
      ]
      if (hasLineups(m)) {
        tabs.push({ key: 'lineups', label: 'Line-ups', render: () => <LineupsTab match={m} /> })
      }
      if (hasStats(m)) {
        tabs.push({ key: 'stats', label: 'Stats', render: () => <StatsTab match={m} /> })
      }
      tabs.push(narrativeTab(view))
      return { tabs, defaultTab: 'summary' }
    }
  }
}
