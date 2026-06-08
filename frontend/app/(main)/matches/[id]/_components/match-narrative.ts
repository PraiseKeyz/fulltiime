import type { MatchView } from './phase'
import { getViewMeta } from './view-meta'
import { formatMatchDate, formatKickoff } from '@/lib/utils'

// ─── Auto-narrative ──────────────────────────────────────────────────────────
//
// The narrative is present in every phase (see docs/match-page-spec.md) — what
// changes is the wording and the tab label. This is pure text generation; the
// NarrativeTab component renders the result.

export interface Narrative {
  /** Tab label for this phase: "Preview" | "Report" | "Info". */
  label: string
  /** Body paragraphs, already composed from the match metadata. */
  paragraphs: string[]
}

function whenStr(date: string | null): string {
  if (!date) return ''
  return `${formatMatchDate(date)} · ${formatKickoff(date)}`
}

function competition(league: string | null, stage: string | null): string {
  if (!league) return 'this competition'
  return stage ? `${league} ${stage}` : league
}

export function getNarrative(view: MatchView): Narrative {
  const m = getViewMeta(view)
  const at = m.venueName ? ` at ${m.venueName}` : ''
  const when = whenStr(m.date)
  const onWhen = when ? ` on ${when}` : ''
  const comp = competition(m.league, m.stage)

  switch (view.phase) {
    case 'tbd':
      return {
        label: 'Preview',
        paragraphs: [
          `${m.home} faces ${m.away}${at}${onWhen}, as part of the ${comp}.`,
          'The teams will be confirmed once the earlier rounds are played. Check back for line-ups, stats and live updates closer to kick-off.',
        ],
      }

    case 'upcoming':
      return {
        label: 'Preview',
        paragraphs: [
          `${m.home} host ${m.away}${at}${onWhen} in the ${comp}.`,
          'Line-ups are typically confirmed about an hour before kick-off. Check back for team news, stats and live commentary as the game approaches.',
        ],
      }

    case 'live':
      return {
        label: 'Preview',
        paragraphs: [
          `${m.home} vs ${m.away} is underway${at} in the ${comp}.`,
          'The summary, line-ups and stats above are updating live as the match progresses.',
        ],
      }

    case 'finished': {
      const hs = m.homeScore ?? 0
      const as = m.awayScore ?? 0
      const verb = hs > as ? 'beat' : hs < as ? 'lost to' : 'drew with'
      return {
        label: 'Report',
        paragraphs: [
          `${m.home} ${verb} ${m.away} ${hs}–${as}${at}${onWhen} in the ${comp}.`,
          'See the summary, line-ups and full match statistics above for how the game unfolded.',
        ],
      }
    }

    case 'postponed':
      return {
        label: 'Info',
        paragraphs: [
          `The ${comp} match between ${m.home} and ${m.away}${when ? `, scheduled for ${when}` : ''}${at}, has been postponed.`,
          'A new date is yet to be confirmed. Check back for the rescheduled fixture.',
        ],
      }

    case 'cancelled':
      return {
        label: 'Info',
        paragraphs: [
          `The ${comp} match between ${m.home} and ${m.away}${when ? `, scheduled for ${when}` : ''}${at}, has been cancelled.`,
          'This fixture will not be played.',
        ],
      }
  }
}
