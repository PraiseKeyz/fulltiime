import Link from 'next/link'
import { Newspaper, ChevronRight, Clock } from 'lucide-react'
import { getLatestNews, timeAgo, TAG_COLORS, type NewsArticle } from '@/data/news'

function Cover({ src, className }: { src: string; className?: string }) {
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

function FeaturedCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group grid sm:grid-cols-2 rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <Cover src={article.cover} className="h-48 sm:h-full min-h-[200px]" />
      <div className="p-5 flex flex-col justify-center gap-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TAG_COLORS[article.category] ?? '#888' }}>
          {article.category}
        </span>
        <h3 className="text-lg font-black leading-snug group-hover:text-primary transition-colors line-clamp-3">
          {article.title}
        </h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
          <span className="font-semibold text-foreground">{article.author}</span>
          <span>·</span>
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}

function CompactCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors"
    >
      <Cover src={article.cover} className="h-16 w-16 rounded-lg shrink-0" />
      <div className="min-w-0 flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TAG_COLORS[article.category] ?? '#888' }}>
          {article.category}
        </span>
        <h4 className="text-[13px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h4>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-auto">
          <Clock className="h-2.5 w-2.5" />
          {timeAgo(article.publishedAt)} · {article.readTime}
        </span>
      </div>
    </Link>
  )
}

export function NewsSection() {
  const [featured, ...rest] = getLatestNews(5)

  return (
    <section className="py-8 bg-background-secondary">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <Newspaper className="h-5 w-5 text-primary" />
            Latest News
          </h2>
          <Link href="/news" className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            All News <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          {featured && <FeaturedCard article={featured} />}
          <div className="grid gap-3">
            {rest.slice(0, 4).map(a => <CompactCard key={a.id} article={a} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
