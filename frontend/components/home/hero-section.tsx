'use client'

import { Play, BookOpen, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// ── Stat bar ──────────────────────────────────────────────────────────────────

function StatBar({
  label,
  home,
  away,
  max,
}: {
  label: string
  home: number
  away: number
  max: number
}) {
  const homeW = Math.round((home / max) * 100)
  const awayW = Math.round((away / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-semibold text-foreground/70">
        <span>{home}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span>{away}</span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="flex flex-1 justify-end rounded-l-full overflow-hidden bg-border">
          <div className="bg-primary rounded-l-full" style={{ width: `${homeW}%` }} />
        </div>
        <div className="flex flex-1 rounded-r-full overflow-hidden bg-border">
          <div className="bg-muted-foreground/60 rounded-r-full" style={{ width: `${awayW}%` }} />
        </div>
      </div>
    </div>
  )
}

// ── Trending article ──────────────────────────────────────────────────────────

function TrendingItem({
  index,
  tag,
  tagColor,
  title,
  time,
}: {
  index: string
  tag: string
  tagColor: string
  title: string
  time: string
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
      <span className="text-2xl font-black text-white/20 leading-none w-6 shrink-0">{index}</span>
      <div className="min-w-0">
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: tagColor }}
        >
          {tag}
        </span>
        <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">{time}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
    </div>
  )
}

// ── Hero section ──────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section className="bg-[#111111] dark:bg-[#111111] light:bg-[#1a1a1a]">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-4 grid lg:grid-cols-[1fr_320px] gap-4">

        {/* ── Featured match widget ── */}
        <div className="rounded-xl bg-[#1a1a1a] border border-white/10 p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[#4da6ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4da6ff]" />
              UEFA Champions League
            </span>
            <span className="flex items-center gap-1.5 text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
              LIVE — 67&apos;
            </span>
          </div>

          {/* Teams & score */}
          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg" alt="Arsenal" className="h-12 w-12 object-contain" />
              </div>
              <span className="text-base font-bold text-white">Arsenal</span>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-5xl font-black text-white tracking-tight">2 : 1</div>
              <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mt-1.5">
                <MapPin className="h-3 w-3" />
                Emirates Stadium, London
              </p>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg" alt="Barcelona" className="h-12 w-12 object-contain" />
              </div>
              <span className="text-base font-bold text-white">Barcelona</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <StatBar label="Possession" home={54} away={46} max={100} />
            <StatBar label="Shots" home={14} away={9} max={23} />
            <StatBar label="xG" home={2.3} away={1.1} max={3.4} />
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-[13px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
              <Play className="h-4 w-4 fill-current" />
              Watch Live
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-[13px] font-bold text-white hover:bg-white/15 transition-colors border border-white/10">
              <BookOpen className="h-4 w-4" />
              Read Analysis
            </button>
          </div>
        </div>

        {/* ── Trending sidebar ── */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Trending Now
            </h2>
          </div>

          <div className="flex-1 space-y-1">
            <TrendingItem
              index="01"
              tag="Champions League"
              tagColor="#4da6ff"
              title="Red card controversy: Pedri's early dismissal sparks debate"
              time="8 min ago"
            />
            <TrendingItem
              index="02"
              tag="Arsenal"
              tagColor="#ef4444"
              title="Saka reaches 20 UCL goals for Arsenal — fastest ever"
              time="22 min ago"
            />
            <TrendingItem
              index="03"
              tag="Barcelona"
              tagColor="#4da6ff"
              title="Flick's rotation gamble: Barcelona's squad depth tested"
              time="45 min ago"
            />
          </div>

          <Link
            href="/matches"
            className="mt-3 flex items-center justify-between rounded-lg border border-border px-4 py-3 text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            View All Today&apos;s Matches
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
