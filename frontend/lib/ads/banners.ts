
export interface AdCreative {
  src: string
  width: number
  height: number
}

export const CREATIVES = {
  '1xbet-300x200-a': {
    src:    'https://refbanners.com/I?tag=d_5683053m_54181c_&site=5683053&ad=54181',
    width:  300,
    height: 200,
  },

  // Skyscrapers — for the sticky side rails
  '1xbet-160x600-a': {
    src:    'https://refbanners.com/I?tag=d_5683053m_25825c_&site=5683053&ad=25825',
    width:  160,
    height: 600,
  },
  '1xbet-300x600-a': {
    src:    'https://refbanners.com/I?tag=d_5683053m_37417c_&site=5683053&ad=37417',
    width:  160,
    height: 600,
  },
  'hero-top-banner': {
    src:    'https://refbanners.com/I?tag=d_5683053m_54035c_&site=5683053&ad=54035',
    width:  810,
    height: 159,
  },
} satisfies Record<string, AdCreative>

export type CreativeId = keyof typeof CREATIVES
