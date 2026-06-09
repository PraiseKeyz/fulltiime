'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, CheckCircle2 } from 'lucide-react'
import { AuthShell, authInput } from '../_components/auth-shell'
import { useForgotPassword } from '@/lib/api/hooks/auth.hooks'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const { mutate, isPending } = useForgotPassword()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Always land on the same confirmation — never reveal whether the email exists.
    mutate(email, {
      onSuccess: () => setSent(true),
      onError: () => setSent(true),
    })
  }

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <p className="mt-4 text-[14px] text-zinc-600">
            If an account exists for <span className="font-semibold text-zinc-900">{email}</span>, we’ve sent a
            password reset link. It expires in 1 hour.
          </p>
          <Link href="/login" className="mt-6 text-[13px] font-bold text-green-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your email and we’ll send you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInput}
              placeholder="you@fulltiime.com"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full font-black uppercase tracking-wide"
        >
          {isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-zinc-500">
        Remembered it?{' '}
        <Link href="/login" className="font-bold text-green-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
