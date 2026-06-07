'use client'

import { useEffect, useState } from 'react'

// Launch: 9th June 2026, local time
const LAUNCH = new Date('2026-06-09T00:00:00')

export function LaunchCountdown() {
  const [diff, setDiff] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setDiff(LAUNCH.getTime() - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Avoid SSR/hydration mismatch — reserve space until mounted
  if (diff === null) return <div className="h-[68px]" />

  if (diff <= 0) {
    return (
      <p className="text-[15px] font-bold text-primary">We&apos;re live — welcome to Fulltiime ⚽</p>
    )
  }

  const days = Math.floor(diff / 86_400_000)
  const hrs  = Math.floor((diff % 86_400_000) / 3_600_000)
  const mins = Math.floor((diff % 3_600_000) / 60_000)
  const secs = Math.floor((diff % 60_000) / 1_000)

  const units = [
    { v: days, l: 'Days' },
    { v: hrs,  l: 'Hrs'  },
    { v: mins, l: 'Min'  },
    { v: secs, l: 'Sec'  },
  ]

  return (
    <div className="flex items-start gap-4 sm:gap-6">
      {units.map((u, i) => (
        <div key={u.l} className="flex items-start gap-4 sm:gap-6">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black tabular-nums text-white leading-none">
              {String(u.v).padStart(2, '0')}
            </span>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-[#666]">
              {u.l}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-2xl sm:text-3xl font-black text-[#333] leading-none">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
