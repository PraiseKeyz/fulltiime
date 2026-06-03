'use client'

import { Trophy, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import type { League } from '@/lib/api/domain'

const LEAGUE_GRADIENT: Record<string, string> = {
  'Premier League':   'from-purple-900/80 to-purple-600/60',
  'Champions League': 'from-blue-900/80 to-blue-600/60',
  'La Liga':          'from-orange-900/80 to-red-600/60',
  'Serie A':          'from-blue-900/80 to-slate-600/60',
  'Bundesliga':       'from-red-900/80 to-red-700/60',
  'Europa League':    'from-orange-900/80 to-orange-700/60',
}

function LeagueCard({ league }: { league: League }) {
  const gradient = LEAGUE_GRADIENT[league.name] ?? 'from-zinc-900/80 to-zinc-700/60'

  return (
    <Link
      href={`/competitions/${league.id}`}
      className="group relative rounded-xl overflow-hidden aspect-[4/5] border border-border hover:border-primary/40 transition-colors"
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />

      <div className="absolute inset-0 flex items-center justify-center">
        {league.logo_url ? (
          <img
            src={league.logo_url}
            alt={league.name}
            className="h-12 w-12 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-200"
          />
        ) : (
          <Trophy className="h-10 w-10 text-white/20 group-hover:text-white/30 transition-colors" />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-[12px] font-bold text-white leading-snug">{league.name}</p>
        <p className="text-[10px] text-white/60 mt-0.5">{league.country?.name ?? ''}</p>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="relative rounded-xl overflow-hidden aspect-[4/5] border border-border bg-muted animate-pulse" />
  )
}

export function CompetitionsSection() {
  const { data: leagues, isLoading } = useLeagues()

  return (
    <section className="py-8">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <Trophy className="h-5 w-5 text-primary" />
            Competitions
          </h2>
          <Link href="/competitions" className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            All Competitions <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : (leagues ?? []).map(league => <LeagueCard key={league.id} league={league} />)
          }
        </div>
      </div>
    </section>
  )
}
