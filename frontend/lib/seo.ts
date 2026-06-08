import type { Metadata } from 'next'

export const SITE_URL  = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fulltiime.com').replace(/\/$/, '')
export const SITE_NAME = 'Fulltiime'
export const SITE_DESCRIPTION =
  'Live football scores, fixtures, results, league standings, team stats and the latest football news — all in one place on Fulltiime.'

// Default social share image. `/fulltime.png` already ships in /public.
export const DEFAULT_OG_IMAGE = '/fulltime.png'

export const TWITTER_HANDLE = '@fulltiime'

// Resolve a path to an absolute URL against the canonical origin.
export function absoluteUrl(path = ''): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Build a page-level Metadata object with sensible OpenGraph / Twitter defaults
 * derived from the site root. Pass a `path` to emit a canonical URL.
 */
export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
}: {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
}): Metadata {
  const canonical = path ? absoluteUrl(path) : undefined
  return {
    title,
    description,
    ...(canonical && { alternates: { canonical } }),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type,
      ...(canonical && { url: canonical }),
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
