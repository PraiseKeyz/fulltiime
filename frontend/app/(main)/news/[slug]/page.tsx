'use client'

import { useParams } from 'next/navigation'
import { Newspaper, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getArticleBySlug, getRelatedNews, timeAgo, TAG_COLORS, type NewsArticle } from '@/data/news'

function RelatedCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <div className="h-32 bg-muted overflow-hidden relative">
        {article.cover ? (
          <img src={article.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="h-7 w-7 text-muted-foreground/20" />
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TAG_COLORS[article.category] ?? '#888' }}>
          {article.category}
        </span>
        <h4 className="text-[13px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h4>
      </div>
    </Link>
  )
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = getArticleBySlug(slug)

  if (!article) {
    return (
      <div className="mx-auto max-w-[900px] px-4 lg:px-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">Article not found.</p>
        <Link href="/news" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          Back to News
        </Link>
      </div>
    )
  }

  const related = getRelatedNews(slug, 3)

  return (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="mx-auto max-w-[900px] px-4 lg:px-6">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to News
          </Link>

          <span className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: TAG_COLORS[article.category] ?? '#888' }}>
            {article.category}
          </span>

          <h1 className="text-3xl font-black leading-tight">{article.title}</h1>

          {article.excerpt && (
            <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">{article.excerpt}</p>
          )}

          <div className="flex items-center gap-2 mt-4 text-[12px] text-muted-foreground">
            <span className="font-semibold text-foreground">{article.author}</span>
            <span>·</span>
            <span>{timeAgo(article.publishedAt)}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[900px] px-4 lg:px-6 py-8">
        {/* Cover */}
        {article.cover ? (
          <img src={article.cover} alt={article.title} className="w-full rounded-xl object-cover max-h-[440px] mb-8" />
        ) : (
          <div className="w-full rounded-xl bg-muted h-64 flex items-center justify-center mb-8">
            <Newspaper className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}

        {/* Content */}
        <div className="max-w-none space-y-4">
          {article.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
              {para}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
            {article.tags.map(tag => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-[12px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border">
            <h2 className="text-[13px] font-black uppercase tracking-wide mb-4">Related Stories</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(a => <RelatedCard key={a.id} article={a} />)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
