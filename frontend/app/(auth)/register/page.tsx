'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useRegister } from '@/lib/api/hooks/auth.hooks'
import { Button } from '@/components/ui/button'
import { GoogleAuthButton } from '../_components/google-auth-button'
import { GuestGuard } from '../_components/guest-guard'

// Derive a username from the email local-part (the form intentionally omits a username field)
function usernameFromEmail(email: string) {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
  return base.length >= 3 ? base : `${base}fan`
}

export default function RegisterPage() {
  const router = useRouter()
  const { mutate: register, isPending } = useRegister()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    register(
      { ...form, username: usernameFromEmail(form.email) },
      { onSuccess: () => router.push('/') },
    )
  }

  return (
    <GuestGuard>
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Brand hero ─────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#04140c] via-[#06371f] to-[#0a5c34] p-12 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/auth-stadium.png')" }}
        />

        <Link href="/" className="relative flex items-center w-fit">
          <img src="/logo.svg" alt="Fulltiime" className="h-6 w-auto" />
        </Link>
      </div>

      {/* ── Form panel ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center lg:hidden">
            <img src="/logo.svg" alt="Fulltiime" className="h-7 w-auto" />
          </Link>

          <h2 className="text-4xl font-black uppercase tracking-tight text-foreground">Create account</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">Sign up in seconds. No credit card required.</p>

          {/* Social */}
          <div className="mt-7">
            <GoogleAuthButton />
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Lionel Messi"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending}
              className="w-full text-foreground uppercase tracking-wide"
            >
              {isPending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </GuestGuard>
  )
}
