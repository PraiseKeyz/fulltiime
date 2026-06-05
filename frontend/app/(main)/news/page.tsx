'use client'

import { useState, useMemo } from 'react'
import { Newspaper, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getLatestNews, timeAgo, TAG_COLORS, type NewsArticle } from '@/data/news'

const FILTER_TABS = ['ALL', 'WORLD CUP', 'PREMIER LEAGUE', 'LA LIGA', 'TRANSFERS', 'ANALYSIS', 'BREAKING']

function Cover({ src, alt, className }: { src: string; alt: string; className?: string }) {
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

function FeaturedStory({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group grid md:grid-cols-2 rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <Cover src={article.cover} alt={article.title} className="h-64 md:h-full min-h-[260px]" />
      <div className="p-6 flex flex-col justify-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: TAG_COLORS[article.category] ?? '#888' }}>
          {article.category}
        </span>
        <h2 className="text-2xl font-black leading-snug group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground pt-1">
          <span className="font-semibold text-foreground">{article.author}</span>
          <span>·</span>
          <span>{timeAgo(article.publishedAt)}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  )
}

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <Cover src={article.cover} alt={article.title} className="h-44 w-full" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TAG_COLORS[article.category] ?? '#888' }}>
          {article.category}
        </span>
        <h3 className="text-[14px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border mt-1">
          <span>{timeAgo(article.publishedAt)}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  )
}

export default function NewsPage() {
  const [active, setActive] = useState('ALL')

  const filtered = useMemo(() => {
    const all = getLatestNews()
    if (active === 'ALL') return all
    return all.filter(a => a.categories.includes(active) || a.category === active)
  }, [active])

  const [featured, ...rest] = filtered

  return (
    <>
      {/* Header */}
      <div className="bg-card py-8 border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <h1 className="flex items-center gap-2 text-3xl font-black">
            <Newspaper className="h-7 w-7 text-primary" />
            News
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">The latest from across world football</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-background-secondary border-b border-border sticky top-14 z-40">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-[12px] font-bold transition-colors',
                  active === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8 space-y-6">
        {featured && <FeaturedStory article={featured} />}

        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map(article => <ArticleCard key={article.id} article={article} />)}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No articles found in this category.
          </div>
        )}
      </div>
    </>
  )
}
