'use client'

import Link from 'next/link'
import { Newspaper, ChevronRight, Clock } from 'lucide-react'
import { useArticles } from '@/lib/api/hooks/news.hooks'
import type { Article } from '@/lib/api/domain'

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
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function readTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

function Cover({ src, className }: { src: string | null; className?: string }) {
  return (
    <div className={`bg-muted overflow-hidden relative ${className ?? ''}`}>
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Newspaper className="h-8 w-8 text-muted-foreground/20" />
        </div>
      )}
    </div>
  )
}

function FeaturedCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group grid sm:grid-cols-2 rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <Cover src={article.cover_url} className="h-48 sm:h-full min-h-[200px]" />
      <div className="p-5 flex flex-col justify-center gap-2.5">
        <span className="text-[10px] font-bold tracking-wider capitalize" style={{ color: CATEGORY_COLOR[article.category] ?? '#888' }}>
          {article.category.replace(/_/g, ' ').toLowerCase()}
        </span>
        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-3">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
          <span className="font-semibold text-foreground">{article.author.full_name ?? article.author.username}</span>
          <span>·</span>
          <span>{timeAgo(article.published_at)}</span>
        </div>
      </div>
    </Link>
  )
}

function CompactCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors"
    >
      <Cover src={article.cover_url} className="h-16 w-16 rounded-lg shrink-0" />
      <div className="min-w-0 flex flex-col gap-1">
        <span className="text-[10px] font-semibold tracking-wider capitalize" style={{ color: CATEGORY_COLOR[article.category] ?? '#888' }}>
          {article.category.replace(/_/g, ' ').toLowerCase()}
        </span>
        <h4 className="text-[13px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h4>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-auto">
          <Clock className="h-2.5 w-2.5" />
          {timeAgo(article.published_at)} · {readTime(article.content)}
        </span>
      </div>
    </Link>
  )
}

function FeaturedSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 rounded-xl overflow-hidden border border-border bg-card">
      <div className="h-48 sm:h-full min-h-[200px] bg-muted animate-pulse" />
      <div className="p-5 flex flex-col justify-center gap-3">
        <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
        <div className="h-5 w-full rounded bg-muted animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}

function CompactSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="h-16 w-16 rounded-lg bg-muted animate-pulse shrink-0" />
      <div className="min-w-0 flex flex-col gap-2 flex-1 justify-center">
        <div className="h-2.5 w-12 rounded bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}

export function NewsSection() {
  const { data, isLoading } = useArticles({ limit: 5, category: 'TRANSFER' })
  const articles = data?.articles ?? []
  const [featured, ...rest] = articles

  if (!isLoading && articles.length === 0) return null

  return (
    <section className="py-8 bg-background-secondary">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black tracking-tight">
            Transfer News
          </h2>
          <Link href="/news?category=TRANSFER" className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            All News <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          {isLoading ? (
            <>
              <FeaturedSkeleton />
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, i) => <CompactSkeleton key={i} />)}
              </div>
            </>
          ) : (
            <>
              {featured && <FeaturedCard article={featured} />}
              <div className="grid gap-3">
                {rest.slice(0, 4).map(a => <CompactCard key={a.id} article={a} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
