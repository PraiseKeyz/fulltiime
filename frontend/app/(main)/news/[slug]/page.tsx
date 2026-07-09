'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Cover } from '@/components/content/cover'
import { AiInsights } from '@/components/content/ai-insights'
import { LiveChat } from '@/components/content/live-chat'
import { SponsoredFrame } from '@/components/ads/sponsored-frame'
import { getStory } from '@/lib/dummy-content'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const story = getStory(slug)

  if (!story) {
    return (
      <div className="mx-auto max-w-[var(--content-max)] px-4.5 py-20 text-center sm:px-10">
        <p className="font-mono text-[13px] text-muted-foreground">Article not found.</p>
        <Link
          href="/news"
          className="mt-2 inline-block text-[13px] font-bold text-primary hover:underline"
        >
          Back to News
        </Link>
      </div>
    )
  }

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
          <span className="font-mono text-[12px] tracking-[0.12em] text-primary">
            {story.kicker}
          </span>
          <h1 className="mt-3.5 mb-4.5 text-balance font-inter text-[clamp(32px,6vw,54px)] font-extrabold leading-[1.04] tracking-[-0.02em]">
            {story.headline}
          </h1>
          <div className="mb-5 flex flex-wrap items-center gap-3.5 font-mono text-[13px] text-txt2">
            <span>By {story.author}</span>
            <span className="text-muted-foreground">·</span>
            <span>{story.read} read</span>
            <span className="text-muted-foreground">·</span>
            <span>Today</span>
          </div>

          <AiInsights insights={story.insights} />

          {/* Ad · placement 1 (under AI strip) */}
          <SponsoredFrame zone="article-inline" compact className="mb-6.5" />

          <Cover
            seed={story.headline}
            hue={story.hue}
            alt={story.headline}
            className="mb-2 h-[280px] border border-border sm:h-[420px]"
          />
          <div className="mb-8 font-mono text-[12px] text-muted-foreground">
            [ match photography placeholder ]
          </div>

          <div className="article-prose" dangerouslySetInnerHTML={{ __html: story.bodyHtml }} />

          {/* Ad · placement 2 (mid-article) */}
          <SponsoredFrame zone="article-inline" className="my-8.5 max-w-[680px]" />

          <p className="m-0 max-w-[680px] font-heading text-[22px] leading-[1.12] text-head">
            Football beyond the final whistle isn&apos;t a tagline. It&apos;s where the real game
            lives.
          </p>
        </article>

        {/* Live thread + sidebar ad */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-22">
          <LiveChat storyId={story.slug} />
          {/* Ad · placement 3 (sidebar) */}
          <SponsoredFrame zone="article-sidebar" />
        </div>
      </div>
    </div>
  )
}
