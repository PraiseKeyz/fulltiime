'use client'

import { cn } from '@/lib/utils'
import { AD_ZONES, type AdZoneId } from '@/lib/ads/zones'
import { AdSlot } from './ad-slot'
import { useAdsEnabled } from './ads-provider'

/**
 * Gold editorial ad frame from the Fulltiime design — wraps a real ad zone in
 * the bordered "Advertisement" treatment with the responsible-play footer.
 */
export function SponsoredFrame({
  zone,
  className,
  compact = false,
}: {
  zone: AdZoneId
  className?: string
  compact?: boolean
}) {
  const adsEnabled = useAdsEnabled()
  if (!adsEnabled || !AD_ZONES[zone].enabled) return null

  return (
    <div
      className={cn(
        'relative rounded-xl border border-gold p-4 pt-6',
        'bg-linear-[100deg] from-gold/10 to-gold/[0.02]',
        className,
      )}
    >
      <span className="absolute top-2 right-3 font-mono text-[9px] uppercase tracking-[0.16em] text-gold/85">
        Advertisement
      </span>
      <AdSlot zone={zone} className="gap-0 [&>span]:hidden" />
      {!compact && (
        <div className="mt-2 text-center font-mono text-[9px] text-txt2">
          18+ · Play responsibly · NLRC licensed
        </div>
      )}
    </div>
  )
}
