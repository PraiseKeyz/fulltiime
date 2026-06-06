'use client'

import { Suspense, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Newspaper, BarChart2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsTab } from './_components/news-tab'
import { AnalyticsTab } from './_components/analytics-tab'
import { TransfersTab } from './_components/transfers-tab'

type Section = 'news' | 'analytics' | 'transfers'

const SECTIONS: { key: Section; label: string; icon: typeof Newspaper }[] = [
  { key: 'news',      label: 'News',      icon: Newspaper  },
  { key: 'analytics', label: 'Analytics', icon: BarChart2  },
  { key: 'transfers', label: 'Transfers', icon: TrendingUp },
]

function NewsPageInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const urlTab = searchParams.get('tab') as Section | null
  const [section, setSection] = useState<Section>(
    urlTab && SECTIONS.some(s => s.key === urlTab) ? urlTab : 'news',
  )

  const select = useCallback((value: Section) => {
    setSection(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  return (
    <>
      {/* Header + section tabs */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6 pt-6">
          <h1 className="text-3xl font-black uppercase tracking-wide mb-4">News &amp; Insight</h1>
          <div className="flex gap-1">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => select(key)}
                className={cn(
                  'flex items-center gap-1.5 px-5 py-3 text-[13px] font-bold transition-colors border-b-2 -mb-px',
                  section === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active section */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6">
        {section === 'news'      && <NewsTab />}
        {section === 'analytics' && <AnalyticsTab />}
        {section === 'transfers' && <TransfersTab />}
      </div>
    </>
  )
}

export default function NewsPage() {
  // useSearchParams requires a Suspense boundary
  return (
    <Suspense fallback={null}>
      <NewsPageInner />
    </Suspense>
  )
}
