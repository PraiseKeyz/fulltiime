'use client'

import Link from 'next/link'
import { Check, CornerUpLeft } from 'lucide-react'
import { timeAgo } from '@/lib/editorial'
import { SECTION_META } from '@/lib/sections'
import type { Article } from '@/lib/api/domain'
import {
  usePublishArticle,
  useRejectArticle,
  useStudioArticles,
} from '@/lib/api/hooks/studio.hooks'

function ReviewRow({ article }: { article: Article }) {
  const publish = usePublishArticle()
  const reject = useRejectArticle()
  const busy = publish.isPending || reject.isPending

  const onReject = () => {
    const note = window.prompt(`Feedback for ${article.author.username} (required):`)
    if (!note || note.trim().length < 5) return
    reject.mutate({ id: article.id, note: note.trim() })
  }

  return (
    <div className="border border-border bg-background-secondary px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link href={`/studio/articles/${article.id}`} className="min-w-0 flex-1">
          <h3 className="mb-1 text-[19px] leading-tight hover:text-primary">{article.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-muted-foreground">
            <span className="text-primary">{SECTION_META[article.section].label}</span>
            <span>·</span>
            <span>by {article.author.full_name ?? article.author.username}</span>
            <span>·</span>
            <span>submitted {timeAgo(article.submitted_at)}</span>
          </div>
        </Link>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => publish.mutate(article.id)}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4.5 py-2.25 text-[12px] font-bold text-primary-foreground disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Publish
          </button>
          <button
            onClick={onReject}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-full border border-gold px-4.5 py-2.25 text-[12px] font-bold text-gold disabled:opacity-50"
          >
            <CornerUpLeft className="h-3.5 w-3.5" />
            Send back
          </button>
        </div>
      </div>
      {article.excerpt && (
        <p className="mt-2.5 mb-0 max-w-[640px] text-[13px] leading-relaxed text-txt2">
          {article.excerpt}
        </p>
      )}
    </div>
  )
}

export default function ReviewQueuePage() {
  const { data, isLoading } = useStudioArticles({ status: 'IN_REVIEW', limit: 50 })
  const articles = data?.articles ?? []

  return (
    <>
      <div className="mb-6">
        <span className="mb-1.5 block font-mono text-[11px] tracking-[0.14em] text-primary">
          ◎ STUDIO
        </span>
        <h1 className="m-0 text-[clamp(26px,4vw,38px)] uppercase leading-none">Review Queue</h1>
        <p className="mt-2 font-mono text-[12px] text-muted-foreground">
          submissions waiting for an editor&apos;s call
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[100px] animate-pulse border border-border bg-muted" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="border border-dashed border-border py-20 text-center font-mono text-[13px] text-muted-foreground">
          Queue&apos;s clear. Nothing waiting on you. 🎉
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {articles.map((a) => (
            <ReviewRow key={a.id} article={a} />
          ))}
        </div>
      )}
    </>
  )
}
