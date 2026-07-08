'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/providers/auth-provider'
import { useChangePassword } from '@/lib/api/hooks/auth.hooks'
import { Button } from '@/components/ui/button'

const inputCls =
  'w-full rounded-lg border border-border bg-card pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'

function ChangePasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const redirectTo = callbackUrl?.startsWith('/') ? callbackUrl : '/'

  const { user, isAuthenticated, isLoading } = useAuth()
  const { mutate: changePassword, isPending } = useChangePassword()

  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState(false)

  if (!isLoading && !isAuthenticated) {
    router.replace('/login?callbackUrl=/change-password')
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.next !== form.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (form.next === form.current) {
      toast.error('Choose a different password from the current one')
      return
    }
    changePassword(
      { current_password: form.current, new_password: form.next },
      { onSuccess: () => router.push(redirectTo) },
    )
  }

  const forced = user?.must_change_password

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Fulltiime" className="h-7 w-auto" />
        </Link>

        <h2 className="text-4xl font-black uppercase tracking-tight text-foreground">
          {forced ? 'Set your password' : 'Change password'}
        </h2>
        <p className="mt-2 text-[14px] text-muted-foreground">
          {forced
            ? 'Welcome to the team! Replace your one-time password with one only you know.'
            : 'Enter your current password, then choose a new one.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {forced ? 'One-time password' : 'Current password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={show ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.current}
                onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
                className={inputCls}
                placeholder={forced ? 'From your invite email' : 'Current password'}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={show ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={form.next}
                onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
                className={inputCls}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide passwords' : 'Show passwords'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={show ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                className={inputCls}
                placeholder="Repeat it"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending}
            className="w-full uppercase tracking-wide text-foreground"
          >
            {isPending ? 'Saving…' : 'Save new password'}
          </Button>
        </form>

        {!forced && (
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            <Link href="/" className="font-bold text-primary hover:underline">
              ← Back to the site
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  return (
    <Suspense>
      <ChangePasswordContent />
    </Suspense>
  )
}
