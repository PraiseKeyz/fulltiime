'use client'

import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ANALYTICS_ENABLED, getStoredConsent, setConsent } from '@/lib/analytics'

// Bottom-left cookie banner. Renders only in production (where GA loads) and only
// until the visitor makes a choice. Starts hidden so SSR and first client render
// match; the stored-choice check runs in an effect after mount.
export function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (ANALYTICS_ENABLED && getStoredConsent() === null) setShow(true)
  }, [])

  if (!show) return null

  const choose = (granted: boolean) => {
    setConsent(granted ? 'granted' : 'denied')
    setShow(false)
  }

  return (
    <div className="fixed bottom-4 left-4 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg shadow-black/20">
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold">We use cookies</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            We use analytics cookies to understand how you use Fulltiime and improve it. You can
            accept or decline — declining keeps analytics off.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={() => choose(true)}>
              Accept
            </Button>
            <Button size="sm" variant="ghost" onClick={() => choose(false)}>
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
