import { Trophy, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const COMPETITIONS = [
  { id: 'pl', name: 'Premier League', matchday: 29, color: 'from-purple-900/80 to-purple-600/60', logo: '' },
  { id: 'ucl', name: 'Champions League', matchday: 8, color: 'from-blue-900/80 to-blue-600/60', logo: '' },
  { id: 'laliga', name: 'La Liga', matchday: 28, color: 'from-orange-900/80 to-red-600/60', logo: '' },
  { id: 'seriea', name: 'Serie A', matchday: 27, color: 'from-blue-900/80 to-slate-600/60', logo: '' },
  { id: 'bundesliga', name: 'Bundesliga', matchday: 26, color: 'from-red-900/80 to-red-700/60', logo: '' },
  { id: 'womens', name: "Women's Football", matchday: null, color: 'from-pink-900/80 to-purple-700/60', logo: '' },
]

export function CompetitionsSection() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <Trophy className="h-5 w-5 text-primary" />
            Competitions
          </h2>
          <Link href="/competitions" className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            All Competitions <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {COMPETITIONS.map((comp) => (
            <Link
              key={comp.id}
              href={`/competitions/${comp.id}`}
              className="group relative rounded-xl overflow-hidden aspect-[4/5] border border-border hover:border-primary/40 transition-colors"
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-b ${comp.color} bg-muted`} />

              {/* Logo placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white/20 group-hover:text-white/30 transition-colors" />
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-[12px] font-bold text-white leading-snug">{comp.name}</p>
                {comp.matchday && (
                  <p className="text-[10px] text-white/60 mt-0.5">Matchday {comp.matchday}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
