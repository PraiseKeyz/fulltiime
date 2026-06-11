'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/layout/user-menu'

const NAV_LINKS = [
  { href: '/matches', label: 'Matches' },
  { href: '/leagues', label: 'Leagues' },
  { href: '/news', label: 'News' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 mb-12">
      <div
        className={cn(
          'transition-all duration-300 ease-out',
          scrolled
            ? 'mx-0 mt-0 max-w-none rounded-none border-0 border-b border-border bg-card shadow-none'
            : 'mx-4 mt-3 max-w-[760px] rounded-2xl border border-border bg-card/60 shadow-lg shadow-black/10 backdrop-blur-xl sm:mx-auto',
        )}
      >
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

              <div className="h-6 w-px bg-border mx-1" />

              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
