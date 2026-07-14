import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Cover } from '@/components/content/cover'
import { AiInsights } from '@/components/content/ai-insights'
import { LiveChat } from '@/components/content/live-chat'
import { StoryCard } from '@/components/content/story-card'
import { SponsoredFrame } from '@/components/ads/sponsored-frame'
import { getArticleBySlug, getRelatedArticles } from '@/lib/api/server'
import { hashString, readTime } from '@/lib/editorial'
import { SECTION_META } from '@/lib/sections'
import { toStory } from '@/lib/story'

export const revalidate = 60

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [article, related] = await Promise.all([
    getArticleBySlug(slug),
    getRelatedArticles(slug, 3),
  ])
  if (!article) notFound()

  const relatedStories = related.map(toStory)

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

          {/* 3:2 box matches the 1080×720 upload target — full image, no crop */}
          <Cover
            src={article.cover_url}
            seed={article.title}
            hue={article.hue ?? hashString(article.slug) % 360}
            alt={article.title}
            className="mb-8 aspect-[3/2] w-full border border-border"
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

      {/* You might also like — same tags first, same section to fill the rest */}
      {relatedStories.length > 0 && (
        <div className="border-t border-border pb-15 pt-9">
          <h2 className="m-0 mb-5.5 text-[clamp(24px,3.6vw,32px)] uppercase leading-[0.95]">
            You Might Also Like
          </h2>
          <div className="grid gap-5.5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedStories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
