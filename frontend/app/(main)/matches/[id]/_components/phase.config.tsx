import type { ReactNode } from 'react'
import type { Match } from '@/lib/api/domain'
import type { MatchView } from './phase'
import {
  SummaryTab, LineupsTab, StatsTab, availableStatRows,
} from './match-tab-content'
import { H2HTab } from './match-h2h'
import { ChatTab } from './match-chat'

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

// H2H needs two real, resolved teams — only meaningful once the fixture is no
// longer a placeholder (i.e. every phase except 'tbd'). The tab itself fetches
// lazily and renders an empty state when SportMonks has no shared history.
function h2hTab(m: Match): PhaseTab {
  return { key: 'h2h', label: 'H2H', render: () => <H2HTab match={m} /> }
}

// Grounded in a real Match row (MatchChatService does prisma.match.findUnique),
// so it's withheld for 'tbd' placeholders, which have no Match row to ground on.
function chatTab(m: Match): PhaseTab {
  return { key: 'chat', label: 'Ask', render: () => <ChatTab match={m} /> }
}

export function getPhasePlan(view: MatchView): PhasePlan {
  switch (view.phase) {
    case 'tbd':
      return { tabs: [], defaultTab: '' }

    case 'postponed':
    case 'cancelled': {
      const m = view.match
      return { tabs: [chatTab(m)], defaultTab: 'chat' }
    }

    case 'upcoming': {
      const m = view.match
      const tabs: PhaseTab[] = []
      if (hasLineups(m)) {
        tabs.push({ key: 'lineups', label: 'Line-ups', render: () => <LineupsTab match={m} /> })
      }
      tabs.push(h2hTab(m))
      tabs.push(chatTab(m))
      return { tabs, defaultTab: tabs[0]?.key ?? 'h2h' }
    }

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
      tabs.push(h2hTab(m))
      tabs.push(chatTab(m))
      return { tabs, defaultTab: 'summary' }
    }
  }
}
