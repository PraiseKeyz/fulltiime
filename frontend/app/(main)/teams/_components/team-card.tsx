import Link from 'next/link'
import type { Team } from '@/lib/api/domain'

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors text-center"
    >
      {team.logo_url ? (
        <img
          src={team.logo_url}
          alt={team.name}
          className="h-14 w-14 object-contain group-hover:scale-110 transition-transform duration-200"
        />
      ) : (
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground">
            {team.code ?? team.name.slice(0, 3).toUpperCase()}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold text-[13px] leading-tight truncate w-full">{team.name}</p>
        {team.country && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{team.country.name}</p>
        )}
      </div>
    </Link>
  )
}
