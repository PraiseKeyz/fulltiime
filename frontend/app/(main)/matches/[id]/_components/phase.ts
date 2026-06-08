import type { Match, MatchPreview } from '@/lib/api/domain'

// ─── Phase model ─────────────────────────────────────────────────────────────
//
// Every match the app can render is in exactly one of these phases. The phase —
// not the raw status — drives the whole match page: which hero center, which
// tabs, which rail. See docs/match-page-spec.md.
//
//   tbd        teams not known yet (knockout placeholder)
//   upcoming   teams known, not kicked off
//   live       in progress (incl. half-time)
//   finished   played, has a result
//   postponed  will be replayed on a new date
//   cancelled  will never be played
//
// Note: ABANDONED (kicked off then stopped) and two-legged aggregates are in the
// spec but need backend data we don't have yet, so they aren't represented here.

export type Phase =
  | 'tbd'
  | 'upcoming'
  | 'live'
  | 'finished'
  | 'postponed'
  | 'cancelled'

// A discriminated union: switching on `phase` narrows `match` vs `preview`, so
// consumers never hand-roll `'preview' in data` checks again.
export type MatchView =
  | { phase: 'tbd';       preview: MatchPreview }
  | { phase: 'upcoming';  match: Match }
  | { phase: 'live';      match: Match }
  | { phase: 'finished';  match: Match }
  | { phase: 'postponed'; match: Match }
  | { phase: 'cancelled'; match: Match }

// ─── The single source of truth ──────────────────────────────────────────────

/** Turn raw fixture data into the one phase that drives the whole page. */
export function getMatchPhase(data: Match | MatchPreview): MatchView {
  // Knockout placeholder — teams not yet decided.
  if ('preview' in data) {
    return { phase: 'tbd', preview: data }
  }

  switch (data.status) {
    case 'LIVE':
    case 'HALFTIME':
      return { phase: 'live', match: data }
    case 'FINISHED':
      return { phase: 'finished', match: data }
    case 'POSTPONED':
      return { phase: 'postponed', match: data }
    case 'CANCELLED':
      return { phase: 'cancelled', match: data }
    case 'SCHEDULED':
    default:
      return { phase: 'upcoming', match: data }
  }
}

// ─── Derived helpers ─────────────────────────────────────────────────────────
//
// Small, pure predicates the renderers share — kept here so "what counts as
// live" lives in one place rather than being re-derived in JSX.

/** Live or half-time — the score is ticking and should render in the live colour. */
export function isLivePhase(phase: Phase): boolean {
  return phase === 'live'
}

/** A finished/disrupted-with-result game whose content is data-rich (events, stats). */
export function isConcludedPhase(phase: Phase): boolean {
  return phase === 'finished'
}

/** Quiet phases carry the page on the narrative alone (no events/stats to show). */
export function isQuietPhase(phase: Phase): boolean {
  return phase === 'tbd' || phase === 'upcoming' || phase === 'postponed' || phase === 'cancelled'
}

/** Did not / will not complete normally — drives the disrupted hero badges. */
export function isDisruptedPhase(phase: Phase): boolean {
  return phase === 'postponed' || phase === 'cancelled'
}

/** Both scores are present — guards the score line in the hero center. */
export function hasScore(match: Match): boolean {
  return match.home_score !== null && match.away_score !== null
}
