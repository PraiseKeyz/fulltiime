'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { GoogleLogin, useGoogleOAuth } from '@react-oauth/google'
import { useGoogleLogin } from '@/lib/api/hooks/auth.hooks'

// Renders Google's official "Sign in with Google" button, sized to fill its
// container (the GIS button only accepts a fixed pixel width).
export function GoogleAuthButton() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const { clientId } = useGoogleOAuth()
  const { mutate: loginWithGoogle } = useGoogleLogin()
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!clientId) return null

  return (
    <div ref={containerRef} className="w-full">
      {width > 0 && (
        <GoogleLogin
          onSuccess={({ credential }) => {
            if (!credential) return
            loginWithGoogle(credential, { onSuccess: () => router.push('/') })
          }}
          onError={() => toast.error('Google sign-in failed')}
          theme={resolvedTheme === 'dark' ? 'filled_black' : 'outline'}
          shape="pill"
          size="large"
          text="continue_with"
          width={width}
        />
      )}
    </div>
  )
}
