import { type CreativeId } from './banners'

export type AdFormat = 'leaderboard' | 'mpu' | 'sidebar' | 'mobile' | 'infeed'

export interface AdZone {
  enabled: boolean
  format: AdFormat
  creatives: CreativeId[]
  byRoute?: { prefix: string; creatives: CreativeId[] }[]
}

export const AD_ZONES = {
  'home-top': {
    enabled:   true,
    format:    'leaderboard',
    creatives: ['hero-top-banner'],
  },
  'matches-sidebar': {
    enabled:   true,
    format:    'mpu',
    creatives: ['1xbet-300x200-a'],
  },
  'rail-left': {
    enabled:   true,
    format:    'sidebar',
    creatives: ['1xbet-160x600-a'],
  },
  'rail-right': {
    enabled:   true,
    format:    'sidebar',
    creatives: ['1xbet-300x600-a'],
  },
} satisfies Record<string, AdZone>

export type AdZoneId = keyof typeof AD_ZONES
