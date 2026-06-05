import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getLatestNews, timeAgo, TAG_COLORS } from '@/data/news'

export function HeroNews() {
  const news = getLatestNews(4)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Latest News
        </h3>
      </div>

      <div className="flex-1 min-h-0 space-y-1 overflow-y-auto scrollbar-none">
        {news.map((article, i) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="flex gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <span className="text-2xl font-black text-muted-foreground/30 leading-none w-6 shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: TAG_COLORS[article.category] ?? '#888' }}
              >
                {article.category}
              </span>
              <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(article.publishedAt)}</p>
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
