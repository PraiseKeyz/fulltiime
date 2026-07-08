import { type CreativeId } from './banners'

export type AdFormat = 'leaderboard' | 'mpu' | 'sidebar' | 'mobile' | 'infeed'

export interface AdZone {
  enabled: boolean
  format: AdFormat
  creatives: CreativeId[]
  byRoute?: { prefix: string; creatives: CreativeId[] }[]
}

export const AD_ZONES = {
  'matches-sidebar': {
    enabled:   true,
    format:    'mpu',
    creatives: ['1xbet-300x200-a'],
  },
  'article-inline': {
    enabled:   true,
    format:    'leaderboard',
    creatives: ['hero-top-banner'],
  },
  'article-sidebar': {
    enabled:   true,
    format:    'mpu',
    creatives: ['1xbet-300x200-a'],
  },
} satisfies Record<string, AdZone>

export type AdZoneId = keyof typeof AD_ZONES
