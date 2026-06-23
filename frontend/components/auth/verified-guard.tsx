'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import { useResendVerification } from '@/lib/api/hooks/auth.hooks'
import { AuthShell } from '@/app/(auth)/_components/auth-shell'
import { Button } from '@/components/ui/button'

// Blocks a signed-in but unverified user from the wrapped content entirely,
// instead of the soft, dismissible VerifyEmailBanner shown app-wide. Use this
// around a specific page/action that genuinely requires a confirmed email
// (e.g. posting in Fullchat) rather than just nudging.
export function VerifiedGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { mutate: resend, isPending } = useResendVerification()
  const [sent, setSent] = useState(false)

  if (isLoading) return null

  if (user && !user.is_verified) {
    return (
      <AuthShell title="Verify your email">
        <div className="flex flex-col items-center text-center">
          <Mail className="h-12 w-12 text-primary" />
          <p className="mt-4 text-[14px] text-muted-foreground">
            Confirm <span className="font-semibold text-foreground">{user.email}</span> to continue. We sent
            you a verification link when you signed up.
          </p>

          {sent ? (
            <p className="mt-6 text-[13px] font-semibold text-primary">Verification link sent ✓</p>
          ) : (
            <Button
              onClick={() => resend(user.email, { onSuccess: () => setSent(true), onError: () => setSent(true) })}
              disabled={isPending}
              variant="primary"
              size="lg"
              className="mt-6 w-full font-black uppercase tracking-wide"
            >
              {isPending ? 'Sending…' : 'Resend verification link'}
            </Button>
          )}
        </div>
      </AuthShell>
    )
  }

  return <>{children}</>
}
