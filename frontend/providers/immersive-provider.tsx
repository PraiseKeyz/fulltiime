'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface ImmersiveContextValue {
  immersive:    boolean
  setImmersive: (v: boolean) => void
}

const ImmersiveContext = createContext<ImmersiveContextValue | null>(null)

export function ImmersiveProvider({ children }: { children: ReactNode }) {
  const [immersive, setImmersive] = useState(false)
  return (
    <ImmersiveContext.Provider value={{ immersive, setImmersive }}>
      {children}
    </ImmersiveContext.Provider>
  )
}

// A page declares "I'm immersive right now" (e.g. the match page's Fullchat tab,
// to suppress the footer and rail) by calling setImmersive(true) while active and
// false on cleanup. Defaults to false everywhere else — no other page needs to
// know this exists.
export function useImmersive(): ImmersiveContextValue {
  const ctx = useContext(ImmersiveContext)
  if (!ctx) throw new Error('useImmersive must be used within ImmersiveProvider')
  return ctx
}
