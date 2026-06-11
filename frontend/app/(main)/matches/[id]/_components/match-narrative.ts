import type { MatchView } from './phase'
import { getViewMeta } from './view-meta'
import { formatMatchDate, formatKickoff } from '@/lib/utils'

// ─── TBD fallback narrative ──────────────────────────────────────────────────
//
// Every settled phase (upcoming/live/finished/postponed/cancelled) is served by
// useMatchNarrative — LLM-authored, structured text generated once and locked
// into the DB (see docs/match-page-spec.md §5). TBD placeholders are the one
// exception: they're knockout ties with no real Match row yet, so there's
// nothing for the LLM pipeline to attach text to. This static blurb mirrors the
// LLM shape (intro/highlights/closing) so NarrativeBody renders both identically.

export interface Narrative {
  label:      string
  intro:      string
  highlights: string[]
  closing?:   string
}

export function getTbdNarrative(view: Extract<MatchView, { phase: 'tbd' }>, timeZone: string): Narrative {
  const m = getViewMeta(view)
  const at = m.venueName ? ` at ${m.venueName}` : ''
  const when = m.date ? `${formatMatchDate(m.date, timeZone)} · ${formatKickoff(m.date, timeZone)}` : ''
  const comp = m.league ? (m.stage ? `${m.league} ${m.stage}` : m.league) : 'this competition'

  const highlights: string[] = [`Competition: ${comp}`]
  if (when) highlights.push(`Kickoff: ${when}`)
  if (m.venueName) highlights.push(`Venue: ${m.venueName}`)

  return {
    label: 'Preview',
    intro: `${m.home} faces ${m.away}${at}, with the line-up still to be decided.`,
    highlights,
    closing: 'Check back closer to kick-off for confirmed teams, line-ups and live updates.',
  }
}
