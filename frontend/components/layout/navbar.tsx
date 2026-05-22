'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Search, Bell, Sun, Moon, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/news', label: 'News' },
  { href: '/matches', label: 'Matches' },
  { href: '/live', label: 'Live', live: true },
  { href: '/analytics', label: 'Analytics' },
  { href: '/competitions', label: 'Competitions' },
  { href: '/transfers', label: 'Transfers' },
  { href: '/videos', label: 'Videos' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="grid grid-cols-[auto_1fr_auto] h-14 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Zap className="h-4 w-4 fill-black text-black" />
            </span>
            <span className="text-[15px] font-black tracking-wider text-foreground">
              FULLTIIME
            </span>
          </Link>

          {/* Nav links — centered in the middle column */}
          <nav className="hidden lg:flex items-center justify-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-semibold transition-colors',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
                {link.live && (
                  <span className="flex items-center gap-1 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground leading-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
                    LIVE
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 justify-end">
            <button
              aria-label="Search"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Bell className="h-4 w-4" />
            </button>

            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 block dark:hidden" />
            </button>

            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-[13px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
