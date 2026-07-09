'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'
import { UserMenu } from '@/components/layout/user-menu'
import { useImmersive } from '@/providers/immersive-provider'

const NAV_LINKS = [
  { href: '/news', label: 'News' },
  { href: '/news?category=transfers', label: 'Transfers' },
  { href: '/news?category=tactics', label: 'Tactics' },
  { href: '/news?category=worldcup', label: 'World Cup' },
  { href: '/news?category=beyond', label: 'Beyond' },
]

function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

  return (
    <>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={cn(
            'transition-colors hover:text-primary',
            current === link.href ? 'text-primary' : 'text-foreground',
            className,
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { immersive } = useImmersive()
  const [menuOpen, setMenuOpen] = useState(false)

  if (immersive) return null

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-border backdrop-blur-[14px]"
        style={{ background: 'var(--nav-bg)' }}
      >
        <nav className="flex items-center justify-between gap-3 px-4.5 py-4 sm:gap-6 sm:px-10">
          <Link href="/" aria-label="Fulltiime home" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Fulltiime" className="h-6 w-auto" />
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-7.5 text-[13px] font-semibold tracking-[0.04em] md:flex">
            <Suspense fallback={null}>
              <NavLinks />
            </Suspense>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle light / dark"
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Sun className="hidden h-4 w-4 dark:block" />
              <Moon className="block h-4 w-4 dark:hidden" />
            </button>

            <UserMenu />

            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              className="flex h-9.5 w-9.5 items-center justify-center rounded-[10px] border border-border text-foreground md:hidden"
            >
              {menuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="sticky top-[66px] z-49 flex flex-col border-b border-border px-4.5 pt-1.5 pb-3.5 backdrop-blur-[14px] md:hidden"
          style={{ background: 'var(--nav-bg)' }}
        >
          <Suspense fallback={null}>
            <NavLinks
              className="border-b border-border px-0.5 py-3 text-[17px] font-bold tracking-normal last:border-b-0"
              onNavigate={() => setMenuOpen(false)}
            />
          </Suspense>
        </div>
      )}
    </>
  )
}
