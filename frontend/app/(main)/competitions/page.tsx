'use client'

import { Trophy, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import type { League } from '@/lib/api/domain'

const GRADIENTS: Record<string, string> = {
  'Premier League':   'from-[#1e0540] via-[#3b1280] to-[#6d28d9]',
  'La Liga':          'from-[#3b0a0a] via-[#7f1d1d] to-[#dc2626]',
  'Serie A':          'from-[#042f2e] via-[#065f46] to-[#10b981]',
  'Bundesliga':       'from-[#2d0a0a] via-[#7f1d1d] to-[#b91c1c]',
  'World Cup':        'from-[#0c1a40] via-[#1e3a8a] to-[#3b82f6]',
  'CAF Champions League': 'from-[#1a2e05] via-[#3f6212] to-[#65a30d]',
}

const FALLBACK_GRADIENT = 'from-[#1a1a1a] via-[#2a2a2a] to-[#3a3a3a]'

function CompCard({ league }: { league: League }) {
  const gradient = GRADIENTS[league.name] ?? FALLBACK_GRADIENT

  return (
    <Link
      href={`/competitions/${league.id}`}
      className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
      style={{ minHeight: 180 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative flex flex-col h-full min-h-[180px] p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {league.logo_url
              ? <img src={league.logo_url} alt={league.name} className="h-8 w-8 object-contain" />
              : <Trophy className="h-6 w-6 text-white/50" />
            }
          </div>
          <div>
            <h3 className="text-[17px] font-black text-white uppercase tracking-wide leading-tight">
              {league.name}
            </h3>
            <p className="text-[11px] text-white/60 mt-0.5">
              {league.country?.name ?? 'International'}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-end justify-end mt-4">
          <span className="flex items-center gap-1 text-[12px] font-black text-white whitespace-nowrap group-hover:gap-2 transition-all">
            OPEN HUB <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return <div className="rounded-2xl border border-border bg-muted animate-pulse" style={{ minHeight: 180 }} />
}

export default function CompetitionsPage() {
  const { data: leagues, isLoading } = useLeagues()

  return (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-black uppercase tracking-wide">Competitions</h1>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Standings, fixtures and results — everything contextual, in one place.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : (leagues ?? []).map(league => <CompCard key={league.id} league={league} />)
          }
        </div>
      </div>
    </>
  )
}
