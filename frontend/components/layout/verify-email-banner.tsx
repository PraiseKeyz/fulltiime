'use client'

import { useState } from 'react'
import { Mail, X } from 'lucide-react'
import { useMe, useResendVerification } from '@/lib/api/hooks/auth.hooks'

// Soft-verification reminder: shown app-wide to a signed-in user who hasn't
// confirmed their email yet. Non-blocking — they can dismiss it for the session.
export function VerifyEmailBanner() {
  const { data: me } = useMe()
  const { mutate: resend, isPending } = useResendVerification()
  const [sent, setSent] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (!me || me.is_verified || dismissed) return null

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 lg:px-6 py-2 text-[12px]">
        <Mail className="h-4 w-4 shrink-0" />
        <p className="min-w-0 flex-1">
          <span className="font-semibold">Verify your email</span>
          <span className="hidden sm:inline"> — we sent a link to {me.email}.</span>
        </p>
        {sent ? (
          <span className="shrink-0 font-semibold">Link sent ✓</span>
        ) : (
          <button
            type="button"
            onClick={() => resend(me.email, { onSuccess: () => setSent(true), onError: () => setSent(true) })}
            disabled={isPending}
            className="shrink-0 font-bold underline underline-offset-2 hover:no-underline disabled:opacity-60"
          >
            {isPending ? 'Sending…' : 'Resend'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 opacity-70 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
