'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useStudioArticle } from '@/lib/api/hooks/studio.hooks'
import { ArticleForm } from '../../_components/article-form'

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()
  const { data: article, isLoading, isError } = useStudioArticle(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[860px]">
        <div className="mb-6 h-8 w-56 animate-pulse bg-muted" />
        <div className="flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse border border-border bg-muted" />
          ))}
          <div className="h-[320px] animate-pulse border border-border bg-muted" />
        </div>
      </div>
    )
  }

  if (isError || !article) {
    return (
      <div className="py-20 text-center">
        <p className="font-mono text-[13px] text-muted-foreground">Article not found.</p>
        <Link href="/studio/articles" className="mt-2 inline-block text-[13px] font-bold text-primary hover:underline">
          Back to articles
        </Link>
      </div>
    )
  }

  return <ArticleForm key={article.id} article={article} />
}
