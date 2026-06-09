'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/matches', label: 'Matches' },
  { href: '/leagues', label: 'Leagues' },
  { href: '/news', label: 'News' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="grid grid-cols-[auto_1fr_auto] h-14 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo.svg" alt="Fulltiime" className="h-6 w-auto" />
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
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 justify-end">
            {/* <button
              aria-label="Search"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-4 w-4" />
            </button> */}

            {/* <button
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Bell className="h-4 w-4" />
            </button> */}

            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Sun className="hidden dark:block" />
              <Moon className="block dark:hidden" />
            </Button>

            <div className="h-6 w-px bg-border " />

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-auto rounded-none border-b border-foreground! px-0 py-1 text-[13px] hover:bg-transparent hover:text-primary hover:border-primary!"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
