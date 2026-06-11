import Link from 'next/link'
import type { Standing } from '@/lib/api/domain'

export function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-3 text-left w-8">#</th>
              <th className="px-3 py-3 text-left">Team</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell">W</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell">D</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell">L</th>
              <th className="px-2 py-3 text-center hidden md:table-cell">GF</th>
              <th className="px-2 py-3 text-center hidden md:table-cell">GA</th>
              <th className="px-2 py-3 text-center">GD</th>
              <th className="px-3 py-3 text-center font-black text-foreground">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {standings.map(row => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{row.position}</td>
                <td className="px-3 py-2.5">
                  <Link href={`/teams/${row.team.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    {row.team.logo_url && <img src={row.team.logo_url} alt="" className="h-5 w-5 object-contain" />}
                    <span className="font-medium truncate">{row.team.short_name ?? row.team.name}</span>
                  </Link>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{row.played}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{row.won}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{row.drawn}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{row.lost}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden md:table-cell">{row.goals_for}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground hidden md:table-cell">{row.goals_against}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">
                  {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                </td>
                <td className="px-3 py-2.5 text-center tabular-nums font-black">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
