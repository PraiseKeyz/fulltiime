'use client'

import { createContext, useContext } from 'react'
import { ADS_ENABLED } from '@/lib/ads/config'

const AdsContext = createContext<boolean>(ADS_ENABLED)

export function AdsProvider({
  enabled = ADS_ENABLED,
  children,
}: {
  enabled?: boolean
  children: React.ReactNode
}) {
  return <AdsContext.Provider value={enabled}>{children}</AdsContext.Provider>
}

export function useAdsEnabled() {
  return useContext(AdsContext)
}
