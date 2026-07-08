
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

  'hero-top-banner': {
    src:    'https://refbanners.com/I?tag=d_5683053m_54035c_&site=5683053&ad=54035',
    width:  810,
    height: 150,
  },
} satisfies Record<string, AdCreative>

export type CreativeId = keyof typeof CREATIVES
