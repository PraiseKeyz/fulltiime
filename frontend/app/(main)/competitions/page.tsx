'use client'

import { Trophy, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Competition {
  id: string
  name: string
  region: string
  season: string
  description: string
  gradient: string
  accentFrom: string
  accentTo: string
}

// ── Data ──────────────────────────────────────────────────────────────────────

const COMPETITIONS: Competition[] = [
  {
    id: 'premier-league',
    name: 'Premier League',
    region: 'England',
    season: '2024/25',
    description: "England's top flight — the most-watched league on the planet.",
    gradient: 'from-[#1e0540] via-[#3b1280] to-[#6d28d9]',
    accentFrom: '#3b1280',
    accentTo:   '#6d28d9',
  },
  {
    id: 'champions-league',
    name: 'Champions League',
    region: 'Europe',
    season: '2024/25',
    description: 'Europe's elite club competition. Tuesday and Wednesday nights, magic.',
    gradient: 'from-[#0c1a40] via-[#1e3a8a] to-[#3b82f6]',
    accentFrom: '#1e3a8a',
    accentTo:   '#3b82f6',
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    region: 'Spain',
    season: '2024/25',
    description: 'Spanish football's grand stage — Madrid, Barcelona and beyond.',
    gradient: 'from-[#3b0a0a] via-[#7f1d1d] to-[#dc2626]',
    accentFrom: '#7f1d1d',
    accentTo:   '#dc2626',
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    region: 'Italy',
    season: '2024/25',
    description: 'Italian tactical theatre — the chess match of European football.',
    gradient: 'from-[#042f2e] via-[#065f46] to-[#10b981]',
    accentFrom: '#065f46',
    accentTo:   '#10b981',
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    region: 'Germany',
    season: '2024/25',
    description: 'German football — pace, intensity, and the country's biggest stadiums.',
    gradient: 'from-[#2d0a0a] via-[#7f1d1d] to-[#b91c1c]',
    accentFrom: '#7f1d1d',
    accentTo:   '#b91c1c',
  },
  {
    id: 'womens-football',
    name: "Women's Football",
    region: 'International',
    season: '2024/25',
    description: 'The fastest-growing sport in the world. Stories from across the global game.',
    gradient: 'from-[#2d0a3f] via-[#701a75] to-[#d946ef]',
    accentFrom: '#701a75',
    accentTo:   '#d946ef',
  },
]

// ── Competition card ──────────────────────────────────────────────────────────

function CompCard({ comp }: { comp: Competition }) {
  return (
    <Link
      href={`/competitions/${comp.id}`}
      className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
      style={{ minHeight: 200 }}
    >
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${comp.gradient}`}
      />

      {/* Subtle noise / texture overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative flex flex-col h-full min-h-[200px] p-5">
        {/* Top: logo + name */}
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Trophy className="h-6 w-6 text-white/50" />
          </div>
          <div>
            <h3 className="text-[17px] font-black text-white uppercase tracking-wide leading-tight">
              {comp.name}
            </h3>
            <p className="text-[11px] text-white/60 mt-0.5">
              {comp.region} · {comp.season}
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: description + CTA */}
        <div className="flex items-end justify-between gap-4 mt-4">
          <p className="text-[12px] text-white/70 leading-relaxed max-w-[70%]">
            {comp.description}
          </p>
          <span className="flex items-center gap-1 text-[12px] font-black text-white whitespace-nowrap group-hover:gap-2 transition-all">
            OPEN HUB <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompetitionsPage() {
  return (
    <>
      {/* Dark page header */}
      <div className="bg-[#111111] dark:bg-[#111111] border-b border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-black text-white uppercase tracking-wide">Competitions</h1>
          </div>
          <p className="text-[13px] text-[#888]">
            Standings, fixtures, news and analytics — everything contextual, in one place.
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COMPETITIONS.map((comp) => (
            <CompCard key={comp.id} comp={comp} />
          ))}
        </div>
      </div>
    </>
  )
}
