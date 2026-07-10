import type { Article } from '@/lib/api/domain'
import { hashString, readTime } from '@/lib/editorial'
import { SECTION_META } from '@/lib/sections'

/**
 * Card view-model — the shape the editorial design components render.
 * Adapts a real Article; deterministic fallbacks (hue, chat avatars) keep
 * the design alive where an article has no explicit art.
 */
export interface Story {
  slug: string
  kicker: string
  headline: string
  sub?: string
  author: string
  read: string
  hue: number
  /** Real cover image; cards fall back to the hue gradient without it. */
  src?: string
  move?: string
  crest?: string
  dur?: string
  /** Trending decoration: "142 fans talking" + avatar hues. */
  count?: string
  hues?: number[]
}

export function toStory(a: Article): Story {
  const h = hashString(a.slug)
  return {
    slug: a.slug,
    kicker: a.kicker ?? SECTION_META[a.section].label.toUpperCase(),
    headline: a.title,
    sub: a.excerpt ?? undefined,
    author: a.author.full_name ?? a.author.username,
    read: readTime(a.content),
    hue: a.hue ?? h % 360,
    src: a.cover_url ?? undefined,
    move: a.move ?? undefined,
    crest: a.crest ?? undefined,
    dur: a.duration ?? undefined,
    count: `${40 + (h % 300)} fans talking`,
    hues: [h % 360, (h * 7 + 40) % 360, (h * 13 + 90) % 360, (h * 29 + 200) % 360],
  }
}
