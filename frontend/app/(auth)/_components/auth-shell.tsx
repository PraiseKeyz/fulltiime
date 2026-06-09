'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'

// Shared centered card used by the verify-email / forgot-password / reset-password
// screens. Matches the form-panel styling of the login/register pages.
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
            <Zap className="h-5 w-5 text-black fill-black" />
          </span>
          <span className="text-[20px] font-black tracking-wider text-zinc-900">FULLTIIME</span>
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-center text-2xl font-black uppercase tracking-tight text-zinc-900">{title}</h2>
          {subtitle && <p className="mt-2 text-center text-[14px] text-zinc-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

// Shared input class — mirrors the login form fields.
export const authInput =
  'w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500'
