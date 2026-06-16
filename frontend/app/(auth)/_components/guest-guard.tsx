'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const callbackUrl = searchParams.get('callbackUrl')
      router.replace(callbackUrl?.startsWith('/') ? callbackUrl : '/')
    }
  }, [isLoading, isAuthenticated, router, searchParams])

  if (isLoading || isAuthenticated) return null

  return <>{children}</>
}
