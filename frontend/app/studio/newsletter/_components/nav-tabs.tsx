'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/studio/newsletter/subscribers', label: 'Subscribers' },
  { href: '/studio/newsletter/campaigns', label: 'Campaigns' },
]

export function NewsletterNavTabs() {
  const pathname = usePathname()
  return (
    <div className="mb-6 flex gap-2">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-full border px-4 py-2 text-[13px] font-bold transition-colors',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-txt2 hover:border-primary hover:text-primary',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
