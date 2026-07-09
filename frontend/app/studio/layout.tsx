'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FileText, Inbox, Image as ImageIcon, Users, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { roleAtLeast } from '@/lib/roles'
import { useAuth } from '@/providers/auth-provider'

const NAV = [
  { href: '/studio/articles', label: 'Articles', icon: FileText, min: 'WRITER' as const },
  { href: '/studio/review', label: 'Review Queue', icon: Inbox, min: 'EDITOR' as const },
  { href: '/studio/media', label: 'Media', icon: ImageIcon, min: 'WRITER' as const },
  { href: '/studio/users', label: 'Users', icon: Users, min: 'ADMIN' as const },
]

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    } else if (user?.must_change_password) {
      // Staff with a one-time password must set their own before working.
      router.replace(`/change-password?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [isLoading, isAuthenticated, user, router, pathname])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-[13px] text-muted-foreground">
        Loading studio…
      </div>
    )
  }

  if (!roleAtLeast(user?.role, 'WRITER')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Fulltiime" className="h-8 w-auto" />
        <h1 className="text-[clamp(26px,5vw,40px)] uppercase">No studio access</h1>
        <p className="max-w-[420px] font-mono text-[13px] text-muted-foreground">
          Your account doesn&apos;t have a writer role yet. Ask an admin to invite you to the
          editorial team.
        </p>
        <Link href="/" className="mt-2 rounded-full border border-border px-5 py-2.5 text-[13px] font-bold text-primary hover:border-primary">
          ← Back to the site
        </Link>
      </div>
    )
  }

  const nav = NAV.filter((item) => roleAtLeast(user?.role, item.min))

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar — pinned on desktop; content scrolls independently */}
      <aside className="flex shrink-0 flex-col border-b border-border bg-background-secondary lg:sticky lg:top-0 lg:h-screen lg:w-[230px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-5 pt-5 pb-4">
          <Link href="/studio/articles" aria-label="Studio home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Fulltiime" className="h-5.5 w-auto" />
          </Link>
          <span className="mt-0.5 rounded-[4px] bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em] text-primary-foreground">
            STUDIO
          </span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0" data-scroll>
          {nav.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-txt2 hover:bg-card-hover hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto hidden flex-col gap-3 border-t border-border px-5 py-4 lg:flex">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-head">
              {user?.full_name ?? user?.username}
            </div>
            <div className="font-mono text-[11px] text-primary">{user?.role}</div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            back to the site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1 px-4.5 py-6 sm:px-8">{children}</main>
    </div>
  )
}
