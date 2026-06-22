import type { ReactNode } from 'react'
import type { Match } from '@/lib/api/domain'
import type { MatchView } from './phase'
import {
  SummaryTab, LineupsTab, StatsTab, CommentaryTab, availableStatRows,
} from './match-tab-content'
import { H2HTab } from './match-h2h'
import { ChatTab } from './match-chat'
import { OverviewTab } from './match-overview'
import { LiveChatTab } from './live-chat-tab'

export interface PhaseTab {
  key:    string
  label:  string
  render: () => ReactNode
}

export interface PhasePlan {
  tabs:       PhaseTab[]
  defaultTab: string
}

const hasLineups       = (m: Match) => (m.lineups?.length ?? 0) > 0
const hasStats         = (m: Match) => availableStatRows(m).length > 0
const fullchatEnabled  = process.env.NEXT_PUBLIC_FULLCHAT_ENABLED === 'true'

const FULLCHAT_PRE_KICKOFF_MS = 15 * 60_000
const isNearKickoff = (m: Match) => Date.now() >= new Date(m.kickoff_at).getTime() - FULLCHAT_PRE_KICKOFF_MS

export function fullchatAvailable(view: MatchView): boolean {
  if (!fullchatEnabled) return false
  if (view.phase === 'live' || view.phase === 'finished') return true
  if (view.phase === 'upcoming') return isNearKickoff(view.match)
  return false
}

function overviewTab(m: Match): PhaseTab {
  return { key: 'overview', label: 'Overview', render: () => <OverviewTab match={m} /> }
}

function h2hTab(m: Match): PhaseTab {
  return { key: 'h2h', label: 'H2H', render: () => <H2HTab match={m} /> }
}

function chatTab(m: Match): PhaseTab {
  return { key: 'chat', label: 'Ask', render: () => <ChatTab match={m} /> }
}

function banterTab(m: Match): PhaseTab {
  return { key: 'banter', label: 'Fullchat', render: () => <LiveChatTab match={m} /> }
}

export function getPhasePlan(view: MatchView, isDesktop = false): PhasePlan {
  switch (view.phase) {
    case 'tbd':
      return { tabs: [], defaultTab: '' }

    case 'postponed':
    case 'cancelled': {
      const m = view.match
      return { tabs: [overviewTab(m), chatTab(m)], defaultTab: 'overview' }
    }

    case 'upcoming': {
      const m = view.match
      const tabs: PhaseTab[] = [overviewTab(m)]
      if (hasLineups(m)) {
        tabs.push({ key: 'lineups', label: 'Line-ups', render: () => <LineupsTab match={m} /> })
      }
      tabs.push(h2hTab(m))
      tabs.push(chatTab(m))
      const showBanter = !isDesktop && fullchatAvailable(view)
      if (showBanter) tabs.unshift(banterTab(m))
      return { tabs, defaultTab: showBanter ? 'banter' : 'overview' }
    }

    case 'live':
    case 'finished': {
      const m = view.match
      const tabs: PhaseTab[] = [
        { key: 'summary', label: 'Summary', render: () => <SummaryTab match={m} /> },
        { key: 'commentary', label: 'Commentary', render: () => <CommentaryTab match={m} /> },
      ]
      if (hasLineups(m)) {
        tabs.push({ key: 'lineups', label: 'Line-ups', render: () => <LineupsTab match={m} /> })
      }
      if (hasStats(m)) {
        tabs.push({ key: 'stats', label: 'Stats', render: () => <StatsTab match={m} /> })
      }
      tabs.push(overviewTab(m))
      tabs.push(h2hTab(m))
      tabs.push(chatTab(m))
      const showBanter = !isDesktop && fullchatAvailable(view)
      if (showBanter) tabs.unshift(banterTab(m))
      return { tabs, defaultTab: showBanter ? 'banter' : 'summary' }
    }
  }
}
