import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import type { League } from '@/lib/api/domain'

export function CompetitionCard({ league }: { league: League }) {
  return (
    <Link
      href={`/leagues/${league.id}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
    >
      <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {league.logo_url
          ? <img src={league.logo_url} alt="" className="h-7 w-7 object-contain" />
          : <Trophy className="h-5 w-5 text-muted-foreground" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">
          {league.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{league.country?.name ?? 'International'}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  )
}
