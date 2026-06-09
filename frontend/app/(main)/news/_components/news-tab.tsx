'use client'

import { useState } from 'react'
import { Newspaper, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useArticles } from '@/lib/api/hooks/news.hooks'
import type { Article, ArticleCategory } from '@/lib/api/domain'

// ─── Constants ────────────────────────────────────────────────────────────────

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
  const mins  = Math.floor(diff / 60_000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function readTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

// ─── Cover image ──────────────────────────────────────────────────────────────

function Cover({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  return (
    <div className={cn('bg-muted overflow-hidden relative', className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Newspaper className="h-8 w-8 text-muted-foreground/20" />
        </div>
      )}
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function FeaturedSkeleton() {
  return (
    <div className="grid md:grid-cols-2 rounded-xl overflow-hidden border border-border bg-card">
      <div className="h-64 md:h-full min-h-[260px] bg-muted animate-pulse" />
      <div className="p-6 flex flex-col justify-center gap-3">
        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        <div className="h-7 w-full rounded bg-muted animate-pulse" />
        <div className="h-7 w-3/4 rounded bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <div className="h-44 bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-2.5 w-14 rounded bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}

// ─── Article cards ────────────────────────────────────────────────────────────

function FeaturedStory({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group grid md:grid-cols-2 rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <Cover src={article.cover_url} alt={article.title} className="h-64 md:h-full min-h-[260px]" />
      <div className="p-6 flex flex-col justify-center gap-3">
        <span className="text-[11px] font-bold capitalize tracking-wider" style={{ color: CATEGORY_COLOR[article.category] ?? '#888' }}>
          {article.category.replace(/_/g, ' ').toLowerCase()}
        </span>
        <h2 className="text-[24px] font-semibold tracking-[0.01rem] leading-[1.15] group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground pt-1">
          <span className="font-semibold text-foreground">{article.author.full_name ?? article.author.username}</span>
          <span>·</span>
          <span>{timeAgo(article.published_at)}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{readTime(article.content)}</span>
        </div>
      </div>
    </Link>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <Cover src={article.cover_url} alt={article.title} className="h-44 w-full" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[12px] capitalize font-semibold tracking-wider" style={{ color: CATEGORY_COLOR[article.category] ?? '#888' }}>
          {article.category.replace(/_/g, ' ').toLowerCase()}
        </span>
        <h3 className="text-[16px] font-bold group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border mt-1">
          <span>{timeAgo(article.published_at)}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{readTime(article.content)}</span>
        </div>
      </div>
    </Link>
  )
}

const FILTER_TABS: { label: string; value: ArticleCategory | undefined }[] = [
  { label: 'All',          value: undefined       },
  { label: 'News',         value: 'NEWS'          },
  { label: 'Analysis',     value: 'ANALYSIS'      },
  { label: 'Transfers',    value: 'TRANSFER'      },
  { label: 'Match Report', value: 'MATCH_REPORT'  },
]

// ─── Main tab ─────────────────────────────────────────────────────────────────

const LIMIT = 10

export function NewsTab() {
  const [category, setCategory] = useState<ArticleCategory | undefined>(undefined)
  const [page, setPage]         = useState(1)
  const { data, isLoading }     = useArticles({ category, page, limit: LIMIT })

  const articles   = data?.articles ?? []
  const totalPages = data?.pages ?? 1
  const [featured, ...rest] = articles

  const handleCategory = (value: ArticleCategory | undefined) => {
    setCategory(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map(tab => (
          <Button
            key={tab.label}
            onClick={() => handleCategory(tab.value)}
            variant={category === tab.value ? 'default' : 'ghost'}
            size="sm"
            className={cn('shrink-0 rounded-full px-4 text-[12px]', category !== tab.value && 'text-muted-foreground')}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {isLoading && (
        <>
          <FeaturedSkeleton />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No articles found.
        </div>
      )}

      {!isLoading && featured && <FeaturedStory article={featured} />}

      {!isLoading && rest.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(article => <ArticleCard key={article.id} article={article} />)}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => p - 1)}
            disabled={page <= 1}
            className="h-8 gap-1 text-[12px] text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Button>

          <span className="text-[12px] text-muted-foreground">
            {page} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="h-8 gap-1 text-[12px] text-muted-foreground disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
