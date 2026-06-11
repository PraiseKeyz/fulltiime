'use client'

import { useParams } from 'next/navigation'
import { Newspaper, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useArticle, useArticles } from '@/lib/api/hooks/news.hooks'
import { ArticleSkeleton } from './_components/article-skeleton'
import { RelatedCard } from './_components/related-card'
import { CATEGORY_COLOR } from './_components/category-colors'
import { timeAgo, readTime } from './_components/utils'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: article, isLoading, isError } = useArticle(slug)
  const { data: recent } = useArticles({ limit: 4 })

  const related = (recent?.articles ?? []).filter(a => a.slug !== slug).slice(0, 3)

  if (isLoading) return <ArticleSkeleton />

  if (isError || !article) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">Article not found.</p>
        <Link href="/news" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          Back to News
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to News
          </Link>

          <span className="block text-[11px] font-bold capitalize tracking-wider mb-2" style={{ color: CATEGORY_COLOR[article.category] ?? '#888' }}>
            {article.category.replace(/_/g, ' ').toLowerCase()}
          </span>

          <h1 className="text-3xl font-black leading-tight">{article.title}</h1>

          {article.excerpt && (
            <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">{article.excerpt}</p>
          )}

          <div className="flex items-center gap-2 mt-4 text-[12px] text-muted-foreground">
            <span className="font-semibold text-foreground">{article.author.full_name ?? article.author.username}</span>
            <span>·</span>
            <span>{timeAgo(article.published_at)}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{readTime(article.content)}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8">
        {/* Image floats right at half width — text wraps around it */}
        {article.cover_url ? (
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full md:float-left md:w-1/2 md:mr-8 mb-6 rounded-xl object-cover"
          />
        ) : (
          <div className="w-full md:float-left md:w-1/2 md:mr-8 mb-6 rounded-xl bg-muted h-56 flex items-center justify-center">
            <Newspaper className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}

        <div
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        <div className="clear-both" />

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
            <h2 className="text-[13px] font-black uppercase tracking-wide mb-4">More Stories</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(a => (
                <RelatedCard key={a.id} slug={a.slug} title={a.title} cover_url={a.cover_url} category={a.category} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
