import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Cover } from '@/components/content/cover'
import { AiInsights } from '@/components/content/ai-insights'
import { LiveChat } from '@/components/content/live-chat'
import { SponsoredFrame } from '@/components/ads/sponsored-frame'
import { getArticleBySlug } from '@/lib/api/server'
import { hashString, readTime } from '@/lib/editorial'
import { SECTION_META } from '@/lib/sections'

export const revalidate = 60

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const kicker = article.kicker ?? SECTION_META[article.section].label.toUpperCase()
  const author = article.author.full_name ?? article.author.username
  const published = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div data-bp className="mx-auto max-w-[var(--content-max)] px-4.5 pb-20 sm:px-10 sm:pb-0">
      <Link
        href="/"
        className="flex items-center gap-2 pt-6 pb-1 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← back to the homepage
      </Link>

      <div className="grid items-start gap-7.5 pb-15 lg:grid-cols-[1fr_372px] lg:gap-12">
        {/* Main article */}
        <article className="min-w-0 pt-4.5">
          <span className="font-mono text-[12px] tracking-[0.12em] text-primary">{kicker}</span>
          <h1 className="mt-3.5 mb-4.5 text-balance font-inter text-[clamp(32px,6vw,54px)] font-extrabold leading-[1.04] tracking-[-0.02em]">
            {article.title}
          </h1>
          <div className="mb-5 flex flex-wrap items-center gap-3.5 font-mono text-[13px] text-txt2">
            <span>By {author}</span>
            <span className="text-muted-foreground">·</span>
            <span>{readTime(article.content)} read</span>
            {published && (
              <>
                <span className="text-muted-foreground">·</span>
                <span>{published}</span>
              </>
            )}
          </div>

          <AiInsights insights={article.ai_insights} />

          {/* Ad · placement 1 (under AI strip) */}
          <SponsoredFrame zone="article-inline" compact className="mb-6.5" />

          <Cover
            src={article.cover_url}
            seed={article.title}
            hue={article.hue ?? hashString(article.slug) % 360}
            alt={article.title}
            className="mb-8 h-[280px] border border-border sm:h-[420px]"
          />

          <div className="article-prose" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* Ad · placement 2 (mid-article) */}
          <SponsoredFrame zone="article-inline" className="my-8.5 max-w-[680px]" />

          <p className="m-0 max-w-[680px] font-heading text-[22px] leading-[1.12] text-head">
            Football beyond the final whistle isn&apos;t a tagline. It&apos;s where the real game
            lives.
          </p>
        </article>

        {/* Live thread + sidebar ad */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-22">
          <LiveChat storyId={article.slug} />
          {/* Ad · placement 3 (sidebar) */}
          <SponsoredFrame zone="article-sidebar" />
        </div>
      </div>
    </div>
  )
}
