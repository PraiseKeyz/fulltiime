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

export function readTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min`
}
