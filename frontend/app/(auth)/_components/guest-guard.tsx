'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    const callbackUrl = searchParams.get('callbackUrl')
    const dest = callbackUrl?.startsWith('/') ? callbackUrl : '/'

    // Admin-created staff must set their own password before anything else.
    if (user?.must_change_password) {
      router.replace(`/change-password?callbackUrl=${encodeURIComponent(dest)}`)
    } else {
      router.replace(dest)
    }
  }, [isLoading, isAuthenticated, user, router, searchParams])

  if (isLoading || isAuthenticated) return null

  return <>{children}</>
}
