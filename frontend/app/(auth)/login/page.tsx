'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Zap, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react'
import { useLogin } from '@/lib/api/hooks/auth.hooks'

const PERKS = [
  'Live alerts for your favourite clubs',
  'Save articles, matches, and players',
  'Premium tactical analysis',
  'Personalised feed — no clutter',
]

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.77 2.26-4.1 2.36-4.16-1.29-1.88-3.29-2.14-4-2.17-1.7-.17-3.32.99-4.18.99-.86 0-2.19-.97-3.6-.94-1.85.03-3.56 1.07-4.51 2.72-1.92 3.34-.49 8.28 1.38 10.99.91 1.33 2 2.82 3.42 2.76 1.37-.05 1.89-.89 3.55-.89 1.65 0 2.12.89 3.57.86 1.47-.03 2.41-1.35 3.31-2.68 1.04-1.54 1.47-3.03 1.5-3.11-.03-.01-2.88-1.1-2.91-4.37M14.28 4.16c.76-.92 1.27-2.2 1.13-3.47-1.09.04-2.42.73-3.2 1.64-.7.81-1.31 2.11-1.15 3.35 1.22.1 2.46-.62 3.22-1.52" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { mutate: login, isPending } = useLogin()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login(form, { onSuccess: () => router.push('/') })
  }

  const soon = () => toast('Coming soon', { description: 'This sign-in option isn’t available yet.' })

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Brand hero ─────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#04140c] via-[#06371f] to-[#0a5c34] p-12 text-white">
        {/* Optional stadium photo — drop a file at /public/auth-stadium.jpg to show it */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90 mix-blend-luminosity"
          style={{ backgroundImage: "url('/assets/auth-stadium.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#04140c]/80 via-[#06371f]/70 to-[#0a5c34]/60" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2 w-fit">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
            <Zap className="h-5 w-5 text-black fill-black" />
          </span>
          <span className="text-[20px] font-black tracking-wider">FULLTIIME</span>
        </Link>

        {/* Headline + perks */}
        <div className="relative">
          <h1 className="text-5xl xl:text-6xl font-black uppercase leading-[0.95] tracking-tight">
            Football<br />
            <span className="text-green-400">Organized</span><br />
            Intelligently.
          </h1>
          <p className="mt-5 max-w-md text-[15px] text-white/70 leading-relaxed">
            Personalized scores, clubs, and analysis. Join the platform built for fans who want more than the noise.
          </p>

          <ul className="mt-7 space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-[14px] text-white/90">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 shrink-0">
                  <Check className="h-3 w-3 text-black" strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="relative text-[11px] text-white/40">
          © {new Date().getFullYear()} FULLTIIME — Football organized intelligently.
        </p>
      </div>

      {/* ── Form panel ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center bg-zinc-100 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
              <Zap className="h-5 w-5 text-black fill-black" />
            </span>
            <span className="text-[20px] font-black tracking-wider text-zinc-900">FULLTIIME</span>
          </Link>

          <h2 className="text-4xl font-black uppercase tracking-tight text-zinc-900">Welcome back</h2>
          <p className="mt-2 text-[14px] text-zinc-500">Sign in to continue to your feed.</p>

          {/* Social */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={soon}
              className="flex items-center justify-center gap-2 rounded-lg bg-white border border-zinc-200 py-2.5 text-[13px] font-bold text-zinc-800 hover:bg-zinc-50 transition-colors"
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              onClick={soon}
              className="flex items-center justify-center gap-2 rounded-lg bg-black py-2.5 text-[13px] font-bold text-white hover:bg-zinc-800 transition-colors"
            >
              <AppleIcon /> Apple
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-zinc-200" />
            <span className="text-[11px] font-bold tracking-widest text-zinc-400">OR</span>
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={form.identifier}
                  onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                  placeholder="you@fulltiime.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                  Password
                </label>
                <button type="button" onClick={soon} className="text-[12px] font-bold text-green-600 hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-green-600 py-3 text-[13px] font-black uppercase tracking-wide text-white hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-green-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
