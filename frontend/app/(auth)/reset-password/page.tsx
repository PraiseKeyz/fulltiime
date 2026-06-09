'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { AuthShell, authInput } from '../_components/auth-shell'
import { useResetPassword } from '@/lib/api/hooks/auth.hooks'
import { Button } from '@/components/ui/button'

function ResetPasswordInner() {
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''
  const { mutate, isPending } = useResetPassword()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This password reset link is missing or malformed.">
        <Link href="/forgot-password" className="block text-center text-[13px] font-bold text-green-600 hover:underline">
          Request a new link
        </Link>
      </AuthShell>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    mutate(
      { token, password },
      {
        onSuccess: () => {
          toast.success('Password reset — please sign in.')
          router.push('/login')
        },
        onError: (err: unknown) =>
          setError(err instanceof Error ? err.message : 'This reset link is invalid or has expired.'),
      },
    )
  }

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type={show ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${authInput} pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type={show ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={authInput}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="text-[13px] font-medium text-red-600">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full font-black uppercase tracking-wide"
        >
          {isPending ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-zinc-500">
        <Link href="/login" className="font-bold text-green-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  )
}
