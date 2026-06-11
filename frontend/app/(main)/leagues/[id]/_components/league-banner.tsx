import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import type { League, Season } from '@/lib/api/domain'
import { LEAGUE_GRADIENTS, DEFAULT_LEAGUE_GRADIENT } from './gradients'

export function LeagueBanner({ league, currentSeason }: { league: League; currentSeason: Season | undefined }) {
  const gradient = LEAGUE_GRADIENTS[league.name] ?? DEFAULT_LEAGUE_GRADIENT

  return (
    <div className={`relative bg-gradient-to-br ${gradient} border-b border-border`}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative mx-auto max-w-[1400px] px-4 lg:px-6 py-8">
        <Link href="/leagues" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors mb-5">
          <ArrowLeft className="h-3.5 w-3.5" /> All Leagues
        </Link>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {league.logo_url
              ? <img src={league.logo_url} alt={league.name} className="h-11 w-11 object-contain" />
              : <Trophy className="h-8 w-8 text-white/50" />
            }
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wide leading-tight">
              {league.name}
            </h1>
            <p className="text-[13px] text-white/70 mt-1">
              {league.country?.name ?? 'International'}
              {currentSeason && ` · ${currentSeason.year} Season`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
