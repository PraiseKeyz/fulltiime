import Link from 'next/link'
import {
  Activity,
  CalendarDays,
  Trophy,
  Newspaper,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Instagram,
  Youtube,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Activity,
    title: 'Live Scores',
    desc: 'Real-time scores and minute-by-minute updates across every major league and competition.',
  },
  {
    icon: CalendarDays,
    title: 'Fixtures & Results',
    desc: 'The full schedule and final results — always current and easy to follow.',
  },
  {
    icon: Trophy,
    title: 'Standings & Stats',
    desc: 'Up-to-date league tables, team form, and the numbers behind every match.',
  },
  {
    icon: Newspaper,
    title: 'News & Analysis',
    desc: 'The stories around the game, from breaking news to the in-depth reads.',
  },
  {
    icon: Sparkles,
    title: 'AI Match Insight',
    desc: 'AI-assisted commentary and analysis that turns raw data into a story.',
  },
  {
    icon: MessageSquare,
    title: 'Live Fan Chat',
    desc: 'Talk football with other fans in real time while the action unfolds.',
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
  { label: 'Instagram', href: 'https://www.instagram.com/fulltiimesport', Icon: Instagram },
  { label: 'YouTube', href: 'https://youtube.com/@fulltiimesport', Icon: Youtube },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-10 lg:py-16">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative px-6 py-14 text-center lg:px-14 lg:py-20">
          <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-widest text-primary">
            About Fulltiime
          </span>
          <h1 className="mx-auto max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-foreground lg:text-6xl">
            Football beyond the <span className="text-primary">final whistle.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground lg:text-base">
            Fulltiime brings live scores, fixtures, standings, news, and AI-powered analysis together
            in one place — so everything you follow lives under one roof.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="primary" size="lg" className="rounded-full font-bold">
              <Link href="/matches">
                Explore matches <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full font-bold">
              <Link href="/news">Read the news</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="mt-14 lg:mt-24">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
            Everything, from kickoff to full time
          </h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            One platform for the whole ninety — and everything around it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-[15px] font-bold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="mt-14 lg:mt-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card px-6 py-12 text-center lg:px-14 lg:py-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
            Our mission
          </span>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-bold leading-snug text-foreground lg:text-2xl">
            Following football should feel effortless and alive. We&apos;re building a faster, richer,
            more connected way to experience the sport you love.
          </p>
        </div>
      </section>

      {/* ── Company + contact ────────────────────────────────────────────── */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-lg font-bold text-foreground">The company</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            Fulltiime is a product of{' '}
            <span className="font-semibold text-foreground">Glostarep Media Limited</span> — a small
            team that cares deeply about football and about building a product fans actually enjoy
            using.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-lg font-bold text-foreground">Get in touch</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            Questions, feedback, or a partnership in mind? We&apos;d love to hear from you.
          </p>
          <a
            href="mailto:support@fulltiime.com"
            className="mt-4 inline-block text-[14px] font-bold text-primary hover:underline"
          >
            support@fulltiime.com
          </a>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
