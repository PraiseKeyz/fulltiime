import Link from 'next/link'
import { Cover } from '@/components/content/cover'
import { SponsoredFrame } from '@/components/ads/sponsored-frame'
import {
  FEATURED_STORY,
  SECONDARY_STORIES,
  TRENDING_STORIES,
  AFRICA_STORIES,
  WORLDCUP_STORIES,
  PREMIER_STORIES,
  CHAMPIONS_STORIES,
  LALIGA_STORIES,
  VIDEO_FEATURED,
  VIDEO_STORIES,
  TRANSFER_STORIES,
  TACTICS_STORIES,
  LONGFORM_STORIES,
  type Story,
} from '@/lib/dummy-content'

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
      <Cover seed={story.headline} hue={story.hue} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.96)] from-6% via-[rgba(7,11,9,0.55)] via-42% to-[rgba(7,11,9,0.1)]" />
      <span className="absolute left-5.5 top-5.5 rounded-md border border-primary/28 bg-[rgba(10,15,12,0.5)] px-2.75 py-1.75 font-mono text-[12px] leading-none tracking-[0.12em] text-primary">
        {story.kicker}
      </span>
      <div className="relative max-w-[760px] p-5 sm:p-8.5">
        <h1 className="mb-4 text-balance text-[clamp(34px,7vw,62px)] leading-[0.94] text-white">
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
      className="animate-fade-up grid flex-1 grid-cols-[128px_1fr] items-center gap-4 border border-border bg-background-secondary p-3.5 transition-colors hover:border-primary/40"
    >
      <Cover seed={story.headline} hue={story.hue} className="h-[118px]" />
      <div>
        <span className="font-mono text-[11px] leading-none tracking-[0.1em] text-primary">
          {story.kicker}
        </span>
        <h3 className="mt-2.25 mb-2 line-clamp-3 text-balance text-[24px] leading-none">
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
        <Cover seed={story.headline} hue={story.hue} className="absolute inset-0" />
        <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-primary px-2 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-primary-foreground">
          {story.kicker}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-4">
        <h3 className="m-0 line-clamp-3 text-balance text-[21px] leading-[1.02]">{story.headline}</h3>
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
      className="relative flex min-h-[392px] flex-[0_0_min(360px,82vw)] snap-start flex-col justify-end overflow-hidden border border-border"
    >
      <Cover seed={story.headline} hue={story.hue} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.97)] from-14% via-[rgba(7,11,9,0.4)] via-56% to-[rgba(7,11,9,0.08)]" />
      <div className="relative p-6">
        <span className="rounded-[5px] bg-primary px-2.25 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-primary-foreground">
          {story.kicker}
        </span>
        <h3 className="mt-3.5 mb-2.5 text-balance text-[28px] leading-[0.98] text-white">
          {story.headline}
        </h3>
        {story.sub && (
          <p className="m-0 max-w-[300px] text-[14px] leading-normal text-[#C8D2CA]">{story.sub}</p>
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
      <Cover seed={story.headline} hue={story.hue} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.95)] to-70% to-[rgba(7,11,9,0.15)]" />
      <div className="relative p-5.5">
        <span className="font-mono text-[11px] tracking-[0.1em] text-primary">{story.kicker}</span>
        <h3 className="mt-2 line-clamp-3 text-balance text-[27px] leading-none text-white">
          {story.headline}
        </h3>
      </div>
    </Link>
  )
}

function PosterRail({ title, href, stories }: { title: string; href: string; stories: Story[] }) {
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
      <Cover seed={story.headline} hue={story.hue} className="absolute inset-0" />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.95)] via-[rgba(7,11,9,0.25)] via-55% to-[rgba(7,11,9,0.45)]" />
      <PlayBadge size={88} />
      <span className="absolute right-4.5 top-4.5 flex items-center gap-1.5 border border-white/18 bg-[rgba(10,15,12,0.6)] px-2.5 py-1.25 font-mono text-[11px] text-white">
        ▶ {story.dur}
      </span>
      <div className="relative p-7">
        <span className="font-mono text-[11px] tracking-[0.1em] text-primary">{story.kicker}</span>
        <h3 className="mt-2.5 mb-0 max-w-[580px] text-balance text-[clamp(25px,3.2vw,36px)] leading-none text-white">
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
        <Cover seed={story.headline} hue={story.hue} className="absolute inset-0" />
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(7,11,9,0.55)] to-[rgba(7,11,9,0.05)]" />
        <PlayBadge />
        <span className="absolute bottom-2.5 right-2.5 border border-white/18 bg-[rgba(10,15,12,0.6)] px-2 py-0.75 font-mono text-[10px] text-white">
          {story.dur}
        </span>
      </div>
      <div className="bg-background-secondary px-4 py-3.25">
        <span className="font-mono text-[10px] tracking-[0.1em] text-primary">{story.kicker}</span>
        <h3 className="mt-1.5 mb-0 text-balance text-[19px] leading-[1.04]">{story.headline}</h3>
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
        <Cover seed={story.headline} hue={story.hue} className="absolute inset-0" />
        <div className="absolute -bottom-4 left-4 z-2 flex h-11.5 w-11.5 items-center justify-center rounded-full border-2 border-primary bg-background font-mono text-[14px] font-bold text-primary">
          {story.crest}
        </div>
      </div>
      <div className="px-4 pt-6 pb-4.5">
        <div className="mb-2 font-mono text-[11px] text-muted-foreground">{story.move}</div>
        <h3 className="mb-2 line-clamp-3 text-balance text-[20px] leading-[1.04]">{story.headline}</h3>
        {story.sub && (
          <p className="m-0 line-clamp-2 text-[13px] leading-[1.45] text-txt2">{story.sub}</p>
        )}
      </div>
    </Link>
  )
}

// ─── Tactics rail card (pitch graphic) ────────────────────────────────────────

const PITCH_DOTS: [number, number, boolean][] = [
  [50, 86, false], [24, 70, false], [50, 68, true], [76, 70, false],
  [18, 46, false], [38, 44, false], [62, 44, true], [82, 46, false],
  [34, 22, false], [50, 24, false], [66, 22, false],
]

function TacticsCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="flex-[0_0_320px] snap-start overflow-hidden border border-border bg-background-secondary transition-colors hover:border-primary/40"
    >
      <div className="relative h-[178px] overflow-hidden border-b border-border bg-linear-[150deg] from-[#0d2417] to-[#08160e]">
        <div className="absolute inset-3.5 rounded-md border border-primary/18" />
        <div className="absolute left-3.5 right-3.5 top-1/2 h-px bg-primary/18" />
        <div className="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/18" />
        {PITCH_DOTS.map(([x, y, accent], i) => (
          <div
            key={i}
            className="absolute h-2.75 w-2.75 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              background: accent ? 'var(--primary)' : '#EAF0EA',
              boxShadow: accent ? '0 0 8px color-mix(in srgb, var(--primary) 70%, transparent)' : 'none',
            }}
          />
        ))}
        <span className="absolute bottom-2.5 right-3 font-mono text-[10px] tracking-[0.08em] text-primary/50">
          {story.formation}
        </span>
      </div>
      <div className="p-4">
        <span className="font-mono text-[11px] text-primary">{story.kicker}</span>
        <h3 className="mt-2 mb-0 line-clamp-3 text-balance text-[21px] leading-[1.04]">
          {story.headline}
        </h3>
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
      <Cover seed={story.headline} hue={story.hue} className="min-h-[180px] sm:min-h-[220px]" />
      <div className="flex flex-col justify-center px-5 py-6 sm:px-6.5 sm:py-7">
        <span className="mb-3 font-mono text-[11px] tracking-[0.1em] text-primary">{story.kicker}</span>
        <h3 className="mb-3.5 line-clamp-3 text-balance text-[28px] leading-none">{story.headline}</h3>
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

export function EditorialHome() {
  return (
    <>
      {/* Hero */}
      <Section className="grid items-stretch gap-7.5 pt-8 pb-2 sm:pt-11 lg:grid-cols-[1.62fr_1fr]">
        <HeroFeatured story={FEATURED_STORY} />
        <div className="flex flex-col gap-4">
          <span className="py-0.5 font-mono text-[12px] leading-none tracking-[0.14em] text-muted-foreground">
            THE LATEST
          </span>
          {SECONDARY_STORIES.map((s) => (
            <HeroSecondary key={s.slug} story={s} />
          ))}
        </div>
      </Section>

      {/* Trending discussion */}
      <Section className="pt-11.5 pb-2.5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="animate-blip h-2.25 w-2.25 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
          <h2 className="m-0 text-[26px] tracking-[0.02em]">TRENDING DISCUSSION</h2>
          <span className="ml-1 hidden font-mono text-[13px] text-muted-foreground sm:inline">
            what the dressing room&apos;s arguing about right now
          </span>
        </div>
        <Rail>
          {TRENDING_STORIES.map((s) => (
            <TrendingCard key={s.slug} story={s} />
          ))}
        </Rail>
      </Section>

      {/* The Motherland */}
      <Section className="pt-7.5 pb-2.5">
        <RailHeading title="The Motherland" href="/news?category=motherland" />
        <Rail>
          {AFRICA_STORIES.map((s) => (
            <MotherlandCard key={s.slug} story={s} />
          ))}
        </Rail>
      </Section>

      {/* World Cup + league rails */}
      <PosterRail title="World Cup 2026" href="/news?category=worldcup" stories={WORLDCUP_STORIES} />
      <PosterRail title="Premier League" href="/news?category=premier" stories={PREMIER_STORIES} />
      <PosterRail title="Champions League" href="/news?category=champions" stories={CHAMPIONS_STORIES} />
      <PosterRail title="La Liga" href="/news?category=laliga" stories={LALIGA_STORIES} />

      {/* Fulltiime TV */}
      <Section className="pt-7.5 pb-2.5">
        <RailHeading title="Fulltiime TV" href="/news?category=tv" />
        <div className="grid items-stretch gap-4.5 lg:grid-cols-[1.55fr_1fr]">
          <VideoFeaturedCard story={VIDEO_FEATURED} />
          <div className="flex flex-col gap-4.5">
            {VIDEO_STORIES.map((s) => (
              <VideoCard key={s.slug} story={s} />
            ))}
          </div>
        </div>
      </Section>

      {/* Transfers — sponsored card rides at the end of the rail */}
      <Section className="pt-7.5 pb-2.5">
        <RailHeading title="Transfers" href="/news?category=transfers" />
        <Rail>
          {TRANSFER_STORIES.map((s) => (
            <TransferCard key={s.slug} story={s} />
          ))}
          <SponsoredFrame zone="matches-sidebar" compact className="flex-[0_0_290px] snap-start" />
        </Rail>
      </Section>

      {/* Tactical breakdowns */}
      <Section className="pt-7.5 pb-2.5">
        <RailHeading title="Tactical Breakdowns" href="/news?category=tactics" />
        <Rail>
          {TACTICS_STORIES.map((s) => (
            <TacticsCard key={s.slug} story={s} />
          ))}
        </Rail>
      </Section>

      {/* Beyond the whistle (long-form) */}
      <Section className="pt-7.5 pb-7.5">
        <RailHeading title="Beyond the Whistle" href="/news?category=beyond" />
        <div className="grid gap-5.5 lg:grid-cols-2">
          {LONGFORM_STORIES.map((s) => (
            <LongformCard key={s.slug} story={s} />
          ))}
        </div>
      </Section>
    </>
  )
}
