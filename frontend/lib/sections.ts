import type { Section } from '@/lib/api/domain'

/** Display metadata for the backend Section enum, in homepage-rail order. */
export const SECTION_META: Record<Section, { label: string; title: string; slug: string }> = {
  MOTHERLAND: { label: 'The Motherland', title: 'The Motherland', slug: 'motherland' },
  WORLDCUP:   { label: 'World Cup',      title: 'World Cup', slug: 'worldcup' },
  PREMIER:    { label: 'Premier League', title: 'Premier League', slug: 'premier' },
  CHAMPIONS:  { label: 'Champions',      title: 'Champions League', slug: 'champions' },
  TV:         { label: 'Fulltiime TV',   title: 'Fulltiime TV', slug: 'tv' },
  TRANSFERS:  { label: 'Transfers',      title: 'Transfers', slug: 'transfers' },
  BEYOND:     { label: 'Beyond',         title: 'Beyond the Whistle', slug: 'beyond' },
}

export const ALL_SECTIONS = Object.keys(SECTION_META) as Section[]

/** ?category= slug → Section enum (nav/footer links use the slugs). */
export const CATEGORY_TO_SECTION: Record<string, Section> = Object.fromEntries(
  ALL_SECTIONS.map((s) => [SECTION_META[s].slug, s]),
)
