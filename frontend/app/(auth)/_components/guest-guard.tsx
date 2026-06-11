'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/')
  }, [isLoading, isAuthenticated, router])

  if (isLoading || isAuthenticated) return null

  return <>{children}</>
}
