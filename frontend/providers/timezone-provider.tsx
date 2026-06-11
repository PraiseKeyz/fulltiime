'use client'

import { createContext, useContext, useLayoutEffect, useState } from 'react'
import { DEFAULT_TIME_ZONE } from '@/lib/timezone'

const TimeZoneContext = createContext<string>(DEFAULT_TIME_ZONE)

export function TimeZoneProvider({ children }: { children: React.ReactNode }) {
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE)

  // Runs before the browser paints, so the visitor's local time shows
  // immediately with no flash of the WAT default.
  useLayoutEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (detected) setTimeZone(detected)
  }, [])

  return <TimeZoneContext.Provider value={timeZone}>{children}</TimeZoneContext.Provider>
}

export function useTimeZone() {
  return useContext(TimeZoneContext)
}
