import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import type { SnapshotEntry } from '@/lib/api/domain'

export function LeagueTableCard({ entry }: { entry: SnapshotEntry }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <Link
        href={`/leagues/${entry.league.id}`}
        className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        {entry.league.logo_url ? (
          <img src={entry.league.logo_url} alt="" className="h-5 w-5 object-contain" />
        ) : (
          <Trophy className="h-4 w-4 text-primary" />
        )}
        <span className="text-[13px] font-black uppercase tracking-tight truncate">{entry.league.name}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
      </Link>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2 text-left w-6">#</th>
            <th className="px-2 py-2 text-left">Team</th>
            <th className="px-2 py-2 text-center w-8">P</th>
            <th className="px-4 py-2 text-center w-8">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entry.standings.map((row, idx) => (
            <tr key={row.id} className="hover:bg-muted/30 transition-colors">
              <td className={`px-4 py-2.5 tabular-nums ${idx === 0 ? 'text-primary font-black' : 'text-muted-foreground'}`}>
                {row.position}
              </td>
              <td className="px-2 py-2.5">
                <Link href={`/teams/${row.team.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  {row.team.logo_url && <img src={row.team.logo_url} alt="" className="h-5 w-5 object-contain shrink-0" />}
                  <span className="font-medium truncate">{row.team.short_name ?? row.team.name}</span>
                </Link>
              </td>
              <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{row.played}</td>
              <td className="px-4 py-2.5 text-center tabular-nums font-black">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link
        href={`/leagues/${entry.league.id}`}
        className="mt-auto flex items-center justify-center gap-1 py-2.5 text-[11px] font-bold text-primary hover:underline border-t border-border"
      >
        Full Table <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
