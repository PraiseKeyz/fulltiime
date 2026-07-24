import type { CSSProperties } from 'react'

// ─── Deterministic helpers (ported from the Fulltiime editorial design) ───────

export function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function hueFor(seed: string): number {
  return hashString(seed) % 360
}

/** Design-language placeholder art: hue-shifted oklch gradient + fine hatch. */
export function photoGradient(hue: number): CSSProperties {
  return {
    backgroundImage: `linear-gradient(158deg, oklch(0.33 0.075 ${hue}), oklch(0.13 0.03 ${hue})), repeating-linear-gradient(46deg, rgba(255,255,255,.04) 0 2px, transparent 2px 11px)`,
    backgroundSize: 'cover',
  }
}

export function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/** Strips tags and decodes the handful of entities TipTap output actually uses. */
export function stripHtml(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim()
}

export function readTime(content: string): string {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min`
}
