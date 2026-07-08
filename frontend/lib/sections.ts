import type { Section } from '@/lib/api/domain'

/** Display metadata for the backend Section enum, in homepage order. */
export const SECTION_META: Record<Section, { label: string; title: string }> = {
  NEWS:       { label: 'News',           title: 'News' },
  MOTHERLAND: { label: 'The Motherland', title: 'The Motherland' },
  WORLDCUP:   { label: 'World Cup',      title: 'World Cup 2026' },
  PREMIER:    { label: 'Premier League', title: 'Premier League' },
  CHAMPIONS:  { label: 'Champions',      title: 'Champions League' },
  LALIGA:     { label: 'La Liga',        title: 'La Liga' },
  TV:         { label: 'Fulltiime TV',   title: 'Fulltiime TV' },
  TRANSFERS:  { label: 'Transfers',      title: 'Transfers' },
  TACTICS:    { label: 'Tactics',        title: 'Tactical Breakdowns' },
  BEYOND:     { label: 'Beyond',         title: 'Beyond the Whistle' },
}

export const ALL_SECTIONS = Object.keys(SECTION_META) as Section[]
