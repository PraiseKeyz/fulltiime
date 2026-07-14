import Link from 'next/link'
import { Cover } from '@/components/content/cover'
import { SponsoredFrame } from '@/components/ads/sponsored-frame'
import type { HomePayload } from '@/lib/api/domain'
import { toStory, type Story } from '@/lib/story'

// ─── Shared bits ──────────────────────────────────────────────────────────────

function Section({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section data-bp className={`mx-auto max-w-[var(--content-max)] px-4.5 sm:px-10 ${className}`}>
      {children}
    </section>
  )
}

function RailHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4.5 flex items-end justify-between pt-6.5">
      <h2 className="m-0 text-[clamp(27px,4.6vw,38px)] uppercase leading-[0.95]">{title}</h2>
      <Link
        href={href}
        className="shrink-0 rounded-full border border-border px-4 py-2.25 text-[13px] font-bold text-primary transition-colors hover:border-primary"
      >
        View All →
      </Link>
    </div>
  )
}

function Rail({ children }: { children: React.ReactNode }) {
  return (
    <div data-scroll className="flex snap-x snap-mandatory gap-4.5 overflow-x-auto px-1 pt-1 pb-4.5">
      {children}
    </div>
  )
}

function PlayBadge({ size = 52 }: { size?: number }) {
  return (
    <span
      className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 pl-1 text-[#0A0F0C] shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      ▶
    </span>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroFeatured({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="animate-fade-up group relative flex min-h-[clamp(360px,62vw,560px)] flex-col justify-end overflow-hidden border border-border"
    >
      <Cover src={story.src} seed={story.headline} hue={story.hue} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.96)] from-6% via-[rgba(7,11,9,0.55)] via-42% to-[rgba(7,11,9,0.1)]" />
      <span className="absolute left-5.5 top-5.5 rounded-md border border-primary/28 bg-[rgba(10,15,12,0.5)] px-2.75 py-1.75 font-mono text-[12px] leading-none tracking-[0.12em] text-primary">
        {story.kicker}
      </span>
      <div className="relative max-w-[760px] p-5 sm:p-8.5">
        <h1 className="mb-4 text-balance font-inter text-[clamp(30px,5.5vw,52px)] font-extrabold leading-[1.02] tracking-[-0.02em] text-white">
          {story.headline}
        </h1>
        {story.sub && (
          <p className="mb-4.5 max-w-[600px] text-[19px] font-medium leading-[1.4] text-primary">
            {story.sub}
          </p>
        )}
        <div className="flex items-center gap-3.5 font-mono text-[13px] text-[#C2CCC4]">
          <span>By {story.author}</span>
          <span className="text-muted-foreground">·</span>
          <span>{story.read} read</span>
        </div>
      </div>
    </Link>
  )
}

function HeroSecondary({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="animate-fade-up grid flex-1 grid-cols-[128px_1fr] items-start gap-4 border border-border bg-background-secondary p-3.5 transition-colors hover:border-primary/40"
    >
      <Cover src={story.src} seed={story.headline} hue={story.hue} className="h-[118px]" />
      <div>
        <span className="font-mono text-[11px] leading-none tracking-[0.1em] text-primary">
          {story.kicker}
        </span>
        <h3 className="mt-2.25 mb-2 line-clamp-3 text-balance font-inter text-[19px] font-bold leading-[1.15] tracking-[-0.01em]">
          {story.headline}
        </h3>
        <div className="font-mono text-[12px] text-muted-foreground">
          {story.author} · {story.read}
        </div>
      </div>
    </Link>
  )
}

// ─── Trending discussion ──────────────────────────────────────────────────────

function TrendingCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="flex flex-[0_0_320px] snap-start flex-col overflow-hidden border border-border bg-background-secondary transition-colors hover:border-primary/40"
    >
      <div className="relative h-[150px]">
        <Cover src={story.src} seed={story.headline} hue={story.hue} className="absolute inset-0" />
        <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-primary px-2 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-primary-foreground">
          {story.kicker}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-4">
        <h3 className="m-0 line-clamp-3 text-balance font-inter text-[19px] font-bold leading-[1.2] tracking-[-0.01em]">{story.headline}</h3>
        <div className="mt-auto flex items-center gap-2.5">
          <div className="flex">
            {(story.hues ?? []).map((h, i) => (
              <div
                key={i}
                className="h-6.5 w-6.5 shrink-0 rounded-full border-2 border-background-secondary"
                style={{ background: `oklch(0.62 0.13 ${h})`, marginLeft: i ? '-9px' : 0 }}
              />
            ))}
          </div>
          <span className="font-mono text-[12px] text-primary">{story.count}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── The Motherland ───────────────────────────────────────────────────────────

function MotherlandCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="relative flex min-h-[392px] flex-[0_0_min(380px,82vw)] snap-start flex-col justify-end overflow-hidden border border-border"
    >
      <Cover src={story.src} seed={story.headline} hue={story.hue} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.97)] from-14% via-[rgba(7,11,9,0.4)] via-56% to-[rgba(7,11,9,0.08)]" />
      {/* Fixed-height block: kicker + headline always start at the same top
          offset, whether the headline is 1 or 2 lines or the sub is absent. */}
      <div className="relative min-h-[184px] p-6">
        <span className="rounded-[5px] bg-primary px-2.25 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-primary-foreground">
          {story.kicker}
        </span>
        <h3 className="mt-3.5 mb-2.5 line-clamp-2 text-balance font-inter text-[19px] font-bold leading-[1.2] tracking-[-0.01em] text-white">
          {story.headline}
        </h3>
        {story.sub && (
          <p className="m-0 line-clamp-2 max-w-[300px] text-[14px] leading-normal text-[#C8D2CA]">{story.sub}</p>
        )}
      </div>
    </Link>
  )
}

// ─── Poster rail card (World Cup / league sections) ───────────────────────────

function PosterCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="relative flex min-h-[320px] flex-[0_0_min(380px,82vw)] snap-start flex-col justify-end overflow-hidden border border-border"
    >
      <Cover src={story.src} seed={story.headline} hue={story.hue} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.95)] to-70% to-[rgba(7,11,9,0.15)]" />
      {/* Fixed-height block: kicker + headline start at the same top offset
          across every card in the rail, 1-line headlines included. */}
      <div className="relative min-h-[140px] p-5.5">
        <span className="font-mono text-[11px] tracking-[0.1em] text-primary">{story.kicker}</span>
        <h3 className="mt-2 line-clamp-3 text-balance font-inter text-[19px] font-bold leading-[1.2] tracking-[-0.01em] text-white">
          {story.headline}
        </h3>
      </div>
    </Link>
  )
}

function PosterRail({ title, href, stories }: { title: string; href: string; stories: Story[] }) {
  if (stories.length === 0) return null
  return (
    <Section className="pt-7.5 pb-2.5">
      <RailHeading title={title} href={href} />
      <Rail>
        {stories.map((s) => (
          <PosterCard key={s.slug} story={s} />
        ))}
      </Rail>
    </Section>
  )
}

// ─── Fulltiime TV ─────────────────────────────────────────────────────────────

function VideoFeaturedCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="relative flex min-h-[clamp(320px,46vw,500px)] flex-col justify-end overflow-hidden border border-border"
    >
      <Cover src={story.src} seed={story.headline} hue={story.hue} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.95)] via-[rgba(7,11,9,0.25)] via-55% to-[rgba(7,11,9,0.45)]" />
      <PlayBadge size={88} />
      {story.dur && (
        <span className="absolute right-4.5 top-4.5 flex items-center gap-1.5 border border-white/18 bg-[rgba(10,15,12,0.6)] px-2.5 py-1.25 font-mono text-[11px] text-white">
          ▶ {story.dur}
        </span>
      )}
      <div className="relative min-h-[130px] p-7">
        <span className="font-mono text-[11px] tracking-[0.1em] text-primary">{story.kicker}</span>
        <h3 className="mt-2.5 mb-0 line-clamp-2 max-w-[580px] text-balance font-inter text-[19px] font-bold leading-[1.2] tracking-[-0.01em] text-white">
          {story.headline}
        </h3>
      </div>
    </Link>
  )
}

function VideoCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="flex min-h-[150px] flex-1 flex-col overflow-hidden border border-border"
    >
      <div className="relative min-h-[128px] flex-1">
        <Cover src={story.src} seed={story.headline} hue={story.hue} className="absolute inset-0" />
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.55)] to-[rgba(7,11,9,0.05)]" />
        <PlayBadge />
        {story.dur && (
          <span className="absolute bottom-2.5 right-2.5 border border-white/18 bg-[rgba(10,15,12,0.6)] px-2 py-0.75 font-mono text-[10px] text-white">
            {story.dur}
          </span>
        )}
      </div>
      <div className="bg-background-secondary px-4 py-3.25">
        <span className="font-mono text-[10px] tracking-[0.1em] text-primary">{story.kicker}</span>
        <h3 className="mt-1.5 mb-0 text-balance font-inter text-[19px] font-bold leading-[1.2] tracking-[-0.01em]">{story.headline}</h3>
      </div>
    </Link>
  )
}

// ─── Transfer rail card ───────────────────────────────────────────────────────

function TransferCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="flex flex-[0_0_290px] snap-start flex-col overflow-hidden border border-border bg-background-secondary transition-colors hover:border-primary/40"
    >
      <div className="relative h-[150px]">
        <Cover src={story.src} seed={story.headline} hue={story.hue} className="absolute inset-0" />
        {story.crest && (
          <div className="absolute -bottom-4 left-4 z-2 flex h-11.5 w-11.5 items-center justify-center rounded-full border-2 border-primary bg-background font-mono text-[14px] font-bold text-primary">
            {story.crest}
          </div>
        )}
      </div>
      <div className="px-4 pt-6 pb-4.5">
        {/* Reserved line so the headline starts at the same top offset
            whether or not this story has a move label. */}
        <div className="mb-2 min-h-[16px] font-mono text-[11px] text-muted-foreground">
          {story.move || ' '}
        </div>
        <h3 className="mb-2 line-clamp-3 text-balance font-inter text-[19px] font-bold leading-[1.2] tracking-[-0.01em]">{story.headline}</h3>
        {story.sub && (
          <p className="m-0 line-clamp-2 text-[13px] leading-[1.45] text-txt2">{story.sub}</p>
        )}
      </div>
    </Link>
  )
}

// ─── Long-form grid card ──────────────────────────────────────────────────────

function LongformCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="grid overflow-hidden border border-border bg-background-secondary transition-colors hover:border-primary/40 sm:grid-cols-[200px_1fr]"
    >
      <Cover src={story.src} seed={story.headline} hue={story.hue} className="min-h-[180px] sm:min-h-[220px]" />
      <div className="flex flex-col justify-start px-5 py-6 sm:px-6.5 sm:py-7">
        <span className="mb-3 font-mono text-[11px] tracking-[0.1em] text-primary">{story.kicker}</span>
        <h3 className="mb-3.5 line-clamp-3 text-balance font-inter text-[19px] font-bold leading-[1.2] tracking-[-0.01em]">{story.headline}</h3>
        {story.sub && (
          <p className="mb-4 line-clamp-2 text-[14px] leading-normal text-txt2">{story.sub}</p>
        )}
        <div className="font-mono text-[12px] text-muted-foreground">
          {story.author} · {story.read} read
        </div>
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EditorialHome({ home }: { home: HomePayload }) {
  const featured = home.featured ? toStory(home.featured) : null
  const latest = home.latest.map(toStory)
  const trending = home.trending.map(toStory)
  const rail = (key: keyof HomePayload['sections']) =>
    (home.sections[key] ?? []).map(toStory)

  const motherland = rail('MOTHERLAND')
  const tv = rail('TV')
  const transfers = rail('TRANSFERS')
  const beyond = rail('BEYOND')

  return (
    <>
      {/* Hero */}
      {featured && (
        <Section className="grid items-stretch gap-7.5 pt-8 pb-2 sm:pt-11 lg:grid-cols-[1.62fr_1fr]">
          <HeroFeatured story={featured} />
          <div className="flex flex-col gap-4">
            <span className="py-0.5 font-mono text-[12px] leading-none tracking-[0.14em] text-muted-foreground">
              THE LATEST
            </span>
            {latest.map((s) => (
              <HeroSecondary key={s.slug} story={s} />
            ))}
          </div>
        </Section>
      )}

      {/* Trending discussion */}
      {trending.length > 0 && (
        <Section className="pt-11.5 pb-2.5">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="animate-blip h-2.25 w-2.25 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
            <h2 className="m-0 text-[26px] tracking-[0.02em]">TRENDING DISCUSSION</h2>
            <span className="ml-1 hidden font-mono text-[13px] text-muted-foreground sm:inline">
              what the dressing room&apos;s arguing about right now
            </span>
          </div>
          <Rail>
            {trending.map((s) => (
              <TrendingCard key={s.slug} story={s} />
            ))}
          </Rail>
        </Section>
      )}

      {/* The Motherland */}
      {motherland.length > 0 && (
        <Section className="pt-7.5 pb-2.5">
          <RailHeading title="The Motherland" href="/news?category=motherland" />
          <Rail>
            {motherland.map((s) => (
              <MotherlandCard key={s.slug} story={s} />
            ))}
          </Rail>
        </Section>
      )}

      {/* World Cup + league rails */}
      <PosterRail title="World Cup 2026" href="/news?category=worldcup" stories={rail('WORLDCUP')} />
      <PosterRail title="Premier League" href="/news?category=premier" stories={rail('PREMIER')} />
      <PosterRail title="Champions League" href="/news?category=champions" stories={rail('CHAMPIONS')} />

      {/* Fulltiime TV */}
      {tv.length > 0 && (
        <Section className="pt-7.5 pb-2.5">
          <RailHeading title="Fulltiime TV" href="/news?category=tv" />
          <div className="grid items-stretch gap-4.5 lg:grid-cols-[1.55fr_1fr]">
            <VideoFeaturedCard story={tv[0]} />
            <div className="flex flex-col gap-4.5">
              {tv.slice(1, 3).map((s) => (
                <VideoCard key={s.slug} story={s} />
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Transfers — sponsored card rides at the end of the rail */}
      {transfers.length > 0 && (
        <Section className="pt-7.5 pb-2.5">
          <RailHeading title="Transfers" href="/news?category=transfers" />
          <Rail>
            {transfers.map((s) => (
              <TransferCard key={s.slug} story={s} />
            ))}
            <SponsoredFrame zone="matches-sidebar" compact className="flex-[0_0_290px] snap-start" />
          </Rail>
        </Section>
      )}

      {/* Beyond the whistle (long-form) */}
      {beyond.length > 0 && (
        <Section className="pt-7.5 pb-7.5">
          <RailHeading title="Beyond the Whistle" href="/news?category=beyond" />
          <div className="grid gap-5.5 lg:grid-cols-2">
            {beyond.map((s) => (
              <LongformCard key={s.slug} story={s} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
