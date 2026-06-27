'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon, Goal, Trophy, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/layout/user-menu'
import { useImmersive } from '@/providers/immersive-provider'

const NAV_LINKS = [
  { href: '/matches', label: 'Matches', icon: Goal },
  { href: '/leagues', label: 'Leagues', icon: Trophy },
  { href: '/news', label: 'News', icon: Newspaper },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const { immersive } = useImmersive()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
    {!immersive && (
    <header className="sticky top-0 z-50 mb-4">
      <div
        className={cn(
          'transition-all duration-300 ease-out',
          scrolled
            ? 'mx-0 mt-0 max-w-none rounded-none border-0 border-b border-border bg-card shadow-none'
            : 'mx-4 mt-3 max-w-[760px] rounded-2xl border border-border bg-card/60 shadow-lg shadow-black/10 backdrop-blur-xl sm:mx-auto',
        )}
      >
        <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6">
          <div className="grid grid-cols-[auto_1fr_auto] h-14 items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img src="/logo.svg" alt="Fulltiime" className="h-6 w-auto" />
            </Link>

            {/* Nav links — centered in the middle column (desktop only) */}
            <nav className="hidden md:flex items-center justify-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-semibold transition-colors',
                      active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
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
    )}

    {/* Mobile bottom tab bar — replaces the hidden desktop nav on small screens */}
    {!immersive && (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-3">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <link.icon className={cn('h-5 w-5', active && 'fill-primary/15')} />
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
    )}
    </>
  )
}
