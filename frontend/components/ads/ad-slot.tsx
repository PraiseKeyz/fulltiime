'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CREATIVES, type AdCreative } from '@/lib/ads/banners'
import { AD_ZONES, type AdZone, type AdZoneId } from '@/lib/ads/zones'
import { useAdsEnabled } from './ads-provider'

type Align = 'start' | 'center' | 'end'

export function AdSlot({
  zone,
  className,
  align = 'center',
}: {
  zone: AdZoneId
  className?: string
  align?: Align
}) {
  const adsEnabled = useAdsEnabled()
  const pathname   = usePathname()
  const z: AdZone = AD_ZONES[zone]
  const [creative, setCreative] = useState<AdCreative | null>(null)

  useEffect(() => {
    if (!adsEnabled || !z.enabled) {
      setCreative(null)
      return
    }
    const pool = z.byRoute?.find(r => pathname.startsWith(r.prefix))?.creatives ?? z.creatives
    if (pool.length === 0) {
      setCreative(null)
      return
    }
    const id = pool[Math.floor(Math.random() * pool.length)]
    setCreative(CREATIVES[id] ?? null)
  }, [adsEnabled, zone, z, pathname])

  if (!creative) return null

  const items = align === 'start' ? 'items-start' : align === 'end' ? 'items-end' : 'items-center'

  return (
    <div className={cn('flex flex-col gap-1', items, className)}>
      <ScaledCreative {...creative} align={align} />
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
        Sponsored · 18+
      </span>
    </div>
  )
}


function ScaledCreative({ src, width, height, align }: AdCreative & { align: Align }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const avail = el.clientWidth
      setScale(avail < width ? avail / width : 1)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  const justify = align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-center'

  return (
    <div ref={ref} className={cn('flex w-full overflow-hidden', justify)}>
      <div style={{ width: width * scale, height: height * scale }} className="overflow-hidden">
        <iframe
          src={src}
          width={width}
          height={height}
          loading="lazy"
          scrolling="no"
          title="Sponsored"
          style={{ border: 0, transformOrigin: 'top left', transform: `scale(${scale})` }}
        />
      </div>
    </div>
  )
}
