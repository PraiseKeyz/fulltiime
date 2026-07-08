'use client'

import type { ReactNode } from 'react'
import { useImmersive } from '@/providers/immersive-provider'
import { BlueprintGrid } from '@/components/layout/blueprint-grid'

export function ImmersiveShell({ children }: { children: ReactNode }) {
  const { immersive } = useImmersive()
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      {!immersive && <BlueprintGrid />}
      {children}
    </div>
  )
}
