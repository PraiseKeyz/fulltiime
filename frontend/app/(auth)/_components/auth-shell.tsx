'use client'

import Link from 'next/link'

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
    <div className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <img src="/logo.svg" alt="Fulltiime" className="h-7 w-auto" />
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-center text-2xl font-black uppercase tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-2 text-center text-[14px] text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

// Shared input class — mirrors the login form fields.
export const authInput =
  'w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
