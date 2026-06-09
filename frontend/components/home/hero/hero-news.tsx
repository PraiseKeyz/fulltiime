'use client'

import Link from 'next/link'
import { ChevronRight, Newspaper } from 'lucide-react'
import { useArticles } from '@/lib/api/hooks/news.hooks'

const CATEGORY_COLOR: Record<string, string> = {
  NEWS:         '#3b82f6',
  ANALYSIS:     '#8b5cf6',
  INTERVIEW:    '#10b981',
  TRANSFER:     '#f59e0b',
  MATCH_REPORT: '#ef4444',
}

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function SkeletonItem() {
  return (
    <div className="flex gap-3 p-3">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-2 w-14 rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}

export function HeroNews() {
  const { data, isLoading } = useArticles({ limit: 3 })
  const articles = data?.articles ?? []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <h3 className="text-[20px] font-semibold text-foreground flex items-center gap-1.5">
          Latest News
        </h3>
      </div>

      <div className="flex-1 min-h-0 divide-y divide-muted overflow-y-auto scrollbar-none border border-muted rounded-lg">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)}

        {!isLoading && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/40">
            <Newspaper className="h-6 w-6" />
            <p className="text-[11px]">No news yet</p>
          </div>
        )}

        {!isLoading && articles.map(article => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="flex gap-3 p-3 hover:bg-muted transition-colors group"
          >
            <div className="min-w-0">
              <span
                className="inline-block text-[10px] font-bold capitalize tracking-wider mb-1"
                style={{ color: CATEGORY_COLOR[article.category] ?? '#888' }}
              >
                {article.category.replace(/_/g, ' ').toLowerCase()}
              </span>
              <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(article.published_at)}</p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/news"
        className="mt-3 shrink-0 flex items-center justify-between rounded-lg border border-border px-4 py-3 text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
      >
        All News
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
