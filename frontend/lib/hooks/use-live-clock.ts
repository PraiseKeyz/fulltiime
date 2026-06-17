'use client'

import { useEffect, useState } from 'react'

type ClockInput = {
  status: string
  minute: number | null
  extra_minute: number | null
  period_started_at: number | null
  period_counts_from: number | null
  period_length: number | null
} | null

export interface LiveClock {
  minute: number | null
  extraMinute: number | null
  seconds: number | null
}

export function useLiveClock(match: ClockInput): LiveClock {
  const [, tick] = useState(0)

  const isLive    = match?.status === 'LIVE'
  const hasAnchor = isLive && match?.period_started_at != null

  useEffect(() => {
    if (!hasAnchor) return
    const id = setInterval(() => tick(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [hasAnchor])

  if (!hasAnchor || !match) {
    return { minute: match?.minute ?? null, extraMinute: match?.extra_minute ?? null, seconds: null }
  }

  const elapsed      = Math.floor(Date.now() / 1000) - match.period_started_at!
  const countsFrom   = match.period_counts_from ?? 0
  const periodLen    = match.period_length ?? 45
  const normalEnd    = countsFrom + periodLen
  const rawMinutes   = countsFrom + Math.floor(elapsed / 60)
  const inStoppage   = rawMinutes > normalEnd

  return {
    minute:      inStoppage ? normalEnd : rawMinutes,
    extraMinute: inStoppage ? rawMinutes - normalEnd : null,
    seconds:     elapsed % 60,
  }
}
