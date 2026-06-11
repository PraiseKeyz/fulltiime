'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react'
import { AuthShell, authInput } from '../_components/auth-shell'
import { useVerifyEmail, useResendVerification } from '@/lib/api/hooks/auth.hooks'
import { Button } from '@/components/ui/button'

type Status = 'verifying' | 'success' | 'error'

function ResendForm() {
  const { mutate, isPending } = useResendVerification()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        If an unverified account exists for that email, a fresh verification link is on its way.
      </p>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutate(email, { onSuccess: () => setSent(true), onError: () => setSent(true) })
      }}
      className="mt-6 space-y-3"
    >
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInput}
          placeholder="you@example.com"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isPending}
        className="w-full font-black uppercase tracking-wide"
      >
        {isPending ? 'Sending…' : 'Resend verification link'}
      </Button>
    </form>
  )
}

function VerifyEmailInner() {
  const token = useSearchParams().get('token') ?? ''
  const { mutate: verify } = useVerifyEmail()
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'error')
  const [message, setMessage] = useState(
    token ? '' : 'This verification link is missing its token.',
  )
  const ran = useRef(false)

  useEffect(() => {
    if (!token || ran.current) return
    ran.current = true
    verify(token, {
      onSuccess: () => setStatus('success'),
      onError: (err: unknown) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'This link is invalid or has expired.')
      },
    })
  }, [token, verify])

  if (status === 'verifying') {
    return (
      <AuthShell title="Verifying…">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-[14px] text-muted-foreground">Confirming your email address.</p>
        </div>
      </AuthShell>
    )
  }

  if (status === 'success') {
    return (
      <AuthShell title="Email verified">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <p className="mt-4 text-[14px] text-muted-foreground">
            Your email is confirmed. You’re all set.
          </p>
          <Link href="/" className="mt-6 text-[13px] font-bold text-primary hover:underline">
            Continue to Fulltiime
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Verification failed">
      <div className="flex flex-col items-center text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-[14px] text-muted-foreground">{message}</p>
        <p className="mt-2 text-[13px] text-muted-foreground">Enter your email to get a new link:</p>
      </div>
      <ResendForm />
      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        <Link href="/login" className="font-bold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  )
}
