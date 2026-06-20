'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useImmersive } from '@/providers/immersive-provider'

// pb-16 reserves space for the mobile bottom tab bar — which Navbar itself
// hides while immersive, so the reserved space must go with it or it leaves a
// dead gap (and pushes h-screen content past the visible viewport).
export function ImmersiveShell({ children }: { children: ReactNode }) {
  const { immersive } = useImmersive()
  return (
    <div className={cn('flex flex-col min-h-screen', !immersive && 'pb-16 lg:pb-0')}>
      {children}
    </div>
  )
}
