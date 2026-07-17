import Link from 'next/link'
import {
  Trophy,
  Crown,
  Star,
  Repeat,
  Video,
  BookOpen,
  Globe2,
  Newspaper,
  Sparkles,
  MessageSquare,
  Instagram,
  Youtube,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SECTION_META, ALL_SECTIONS } from '@/lib/sections'
import type { Section } from '@/lib/api/domain'

const SECTION_ICON: Record<Section, React.ComponentType<{ className?: string }>> = {
  MOTHERLAND: Globe2,
  WORLDCUP: Trophy,
  PREMIER: Crown,
  CHAMPIONS: Star,
  TV: Video,
  TRANSFERS: Repeat,
  BEYOND: BookOpen,
}

const DIFFERENTIATORS = [
  {
    icon: Sparkles,
    title: 'AI Insights',
    desc: 'Every story ships with context a casual fan might be missing — key stats, tactical notes, and background, generated and reviewed alongside the piece.',
  },
  {
    icon: MessageSquare,
    title: 'Live Match Threads',
    desc: 'Read with the room. Every article carries a real-time chat, so the conversation happens alongside the story, not in a comments box nobody checks.',
  },
  {
    icon: Newspaper,
    title: 'Independent Editorial',
    desc: 'No wire-service reprints. Every piece is written, reviewed, and published by our own newsroom, from first draft to front page.',
  },
]

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const SOCIALS = [
  { label: 'X', href: 'https://x.com/FulltiimeSport', Icon: XIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/fulltiimesport?igsh=czh5MDhyY3B0am0z', Icon: Instagram },
  { label: 'YouTube', href: 'https://youtube.com/@fulltiimesport?si=-KEhv7IEX706-vb5', Icon: Youtube },
]

export default function AboutPage() {
  return (
    <div data-bp className="mx-auto max-w-[var(--content-max)] px-4.5 pb-20 sm:px-10">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-10 pb-12 text-center sm:pt-14 sm:pb-16">
        <span className="mb-3 block font-mono text-[12px] tracking-[0.14em] text-primary">
          ◎ ABOUT FULLTIIME
        </span>
        <h1 className="mx-auto max-w-[720px] text-balance text-[clamp(32px,6vw,56px)] uppercase leading-[0.96]">
          Football beyond the <span className="text-primary">final whistle.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-relaxed text-txt2">
          Fulltiime is independent football storytelling — deep reads, sharp tactics, and the
          culture around the game, from the Premier League to the pitches of home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="primary" className="rounded-full px-6 py-3 text-[14px]">
            <Link href="/news">Read the news</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6 py-3 text-[14px]">
            <Link href="/news?category=motherland">Explore The Motherland</Link>
          </Button>
        </div>
      </section>

      {/* ── What you'll find here ───────────────────────────────────────────── */}
      <section className="border-t border-border pt-10 pb-2">
        <h2 className="mb-6 text-[clamp(24px,3.6vw,32px)] uppercase leading-[0.95]">
          What You&apos;ll Find Here
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_SECTIONS.map((s) => {
            const Icon = SECTION_ICON[s]
            return (
              <Link
                key={s}
                href={`/news?category=${SECTION_META[s].slug}`}
                className="flex items-center gap-3 border border-border bg-background-secondary p-4 transition-colors hover:border-primary/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-[14px] font-bold text-foreground">
                  {SECTION_META[s].label}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── What makes it different ─────────────────────────────────────────── */}
      <section className="border-t border-border pt-10 pb-2">
        <h2 className="mb-6 text-[clamp(24px,3.6vw,32px)] uppercase leading-[0.95]">
          What Makes It Different
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {DIFFERENTIATORS.map((d) => (
            <div key={d.title} className="border border-border bg-background-secondary p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <d.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 mb-1.5 font-inter text-[17px] font-bold leading-tight tracking-[-0.01em] text-foreground">
                {d.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-txt2">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-10 pb-2">
        <div className="border border-primary/30 bg-linear-to-br from-primary/8 to-transparent px-6 py-10 text-center sm:px-14 sm:py-14">
          <span className="font-mono text-[12px] tracking-[0.14em] text-primary">
            ◎ OUR MISSION
          </span>
          <p className="mx-auto mt-4 max-w-[640px] font-inter text-[22px] font-bold leading-[1.3] text-head sm:text-[26px]">
            Following football should feel effortless and alive. We&apos;re building a faster,
            richer, more connected way to experience the sport you love.
          </p>
        </div>
      </section>

      {/* ── Company + contact ───────────────────────────────────────────────── */}
      <section className="border-t border-border pt-10">
        <div className="grid gap-3.5 lg:grid-cols-2">
          <div className="border border-border bg-background-secondary p-7">
            <h2 className="mb-3 text-[19px] uppercase leading-none">The Company</h2>
            <p className="text-[14px] leading-relaxed text-txt2">
              Fulltiime is a product of{' '}
              <span className="font-semibold text-foreground">Glostarep Media Limited</span> — a
              small team that cares deeply about football and about building something fans
              actually enjoy using.
            </p>
          </div>

          <div className="border border-border bg-background-secondary p-7">
            <h2 className="mb-3 text-[19px] uppercase leading-none">Get In Touch</h2>
            <p className="text-[14px] leading-relaxed text-txt2">
              Questions, feedback, or a partnership in mind? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:fulltiime.sport@gmail.com"
              className="mt-3 inline-block text-[14px] font-bold text-primary hover:underline"
            >
              fulltiime.sport@gmail.com
            </a>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-txt2 transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
