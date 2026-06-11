import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Standing } from '@/lib/api/domain'

export function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-left w-8">#</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">D</th>
              <th className="px-4 py-3 text-center">L</th>
              <th className="px-4 py-3 text-center">GF</th>
              <th className="px-4 py-3 text-center">GA</th>
              <th className="px-4 py-3 text-center">GD</th>
              <th className="px-4 py-3 text-center font-black text-foreground">Pts</th>
              <th className="px-4 py-3 text-center hidden md:table-cell">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {standings.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{row.position}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/teams/${row.team.id}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {row.team.logo_url && (
                      <img src={row.team.logo_url} alt="" className="h-5 w-5 object-contain" />
                    )}
                    <span className="font-medium">{row.team.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">{row.played}</td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">{row.won}</td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">{row.drawn}</td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">{row.lost}</td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">{row.goals_for}</td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">{row.goals_against}</td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                  {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                </td>
                <td className="px-4 py-3 text-center tabular-nums font-black">{row.points}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {row.form && (
                    <div className="flex gap-1 justify-center">
                      {row.form.split('').map((r, i) => (
                        <span
                          key={i}
                          className={cn(
                            'inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
                            r === 'W' && 'bg-green-500 text-white',
                            r === 'D' && 'bg-yellow-500 text-black',
                            r === 'L' && 'bg-red-500 text-white',
                          )}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
