'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Star, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { roleAtLeast } from '@/lib/roles'
import { timeAgo } from '@/lib/editorial'
import { SECTION_META, ALL_SECTIONS } from '@/lib/sections'
import type { Article, ArticleStatus, Section } from '@/lib/api/domain'
import { useFeatureArticle, useStudioArticles } from '@/lib/api/hooks/studio.hooks'
import { Button } from '@/components/ui/button'
import { StatusChip } from '../_components/status-chip'

const STATUS_TABS: { label: string; value: ArticleStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'In review', value: 'IN_REVIEW' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
]

function ArticleRow({ article, canCurate }: { article: Article; canCurate: boolean }) {
  const feature = useFeatureArticle()

  return (
    <div className="flex items-center gap-4 border border-border bg-background-secondary px-4 py-3.5 transition-colors hover:border-primary/40">
      <Link href={`/studio/articles/${article.id}`} className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          {article.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" />}
          <h3 className="truncate text-[17px] leading-tight">{article.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
          <span className="text-primary">{SECTION_META[article.section].label}</span>
          <span>·</span>
          <span>{article.author.full_name ?? article.author.username}</span>
          <span>·</span>
          <span>updated {timeAgo(article.updated_at)}</span>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-2.5">
        {canCurate && article.status === 'PUBLISHED' && !article.is_featured && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => feature.mutate(article.id)}
            disabled={feature.isPending}
            title="Feature as homepage hero"
            className="h-8 w-8 rounded-full text-txt2 hover:border-primary hover:text-primary"
          >
            <Star className="!size-3.5" />
          </Button>
        )}
        <StatusChip status={article.status} />
      </div>
    </div>
  )
}

export default function StudioArticlesPage() {
  const { user } = useAuth()
  const canCurate = roleAtLeast(user?.role, 'EDITOR')

  const [status, setStatus] = useState<ArticleStatus | undefined>(undefined)
  const [section, setSection] = useState<Section | ''>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useStudioArticles({
    status,
    section: section || undefined,
    search: search || undefined,
    page,
  })

  const articles = data?.articles ?? []
  const totalPages = data?.pages ?? 1

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-1.5 block font-mono text-[11px] tracking-[0.14em] text-primary">
            ◎ STUDIO
          </span>
          <h1 className="m-0 text-[clamp(26px,4vw,38px)] uppercase leading-none">Articles</h1>
        </div>
        <Button asChild variant="primary" className="rounded-full px-5">
          <Link href="/studio/articles/new">
            <Plus />
            New Article
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.label}
            size="sm"
            variant={status === tab.value ? 'primary' : 'outline'}
            onClick={() => {
              setStatus(tab.value)
              setPage(1)
            }}
            className={cn('shrink-0 rounded-full', status !== tab.value && 'text-txt2 hover:border-primary hover:text-primary')}
          >
            {tab.label}
          </Button>
        ))}

        <select
          value={section}
          onChange={(e) => {
            setSection(e.target.value as Section | '')
            setPage(1)
          }}
          className="ml-auto rounded-full border border-border bg-background-secondary px-3.5 py-2 text-[12px] font-semibold text-foreground outline-none focus:border-primary"
        >
          <option value="">All sections</option>
          {ALL_SECTIONS.map((s) => (
            <option key={s} value={s}>
              {SECTION_META[s].label}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search titles…"
            className="w-[190px] rounded-full border border-border bg-background-secondary py-2 pl-8.5 pr-3.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[74px] animate-pulse border border-border bg-muted" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="border border-dashed border-border py-20 text-center font-mono text-[13px] text-muted-foreground">
          Nothing here yet. Start your first story.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {articles.map((a) => (
            <ArticleRow key={a.id} article={a} canCurate={canCurate} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="rounded-full text-txt2 hover:border-primary hover:text-primary disabled:opacity-30"
          >
            ← Prev
          </Button>
          <span className="font-mono text-[12px] text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="rounded-full text-txt2 hover:border-primary hover:text-primary disabled:opacity-30"
          >
            Next →
          </Button>
        </div>
      )}
    </>
  )
}
