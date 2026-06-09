'use client'

import { useState } from 'react'
import { useLeagues } from '@/lib/api/hooks/leagues.hooks'
import { useLeagueStandings } from '@/lib/api/hooks/standings.hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function StandingsPage() {
  const { data: leagues } = useLeagues()
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('')

  const activeLeagueId = selectedLeagueId || leagues?.[0]?.id || ''
  const { data: standingsData, isLoading } = useLeagueStandings(activeLeagueId)

  return (
    <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8">
      <h1 className="text-2xl font-black mb-6">Standings</h1>

      {/* League selector */}
      {leagues && leagues.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {leagues.map((league) => (
            <Button
              key={league.id}
              onClick={() => setSelectedLeagueId(league.id)}
              variant={activeLeagueId === league.id ? 'primary' : 'secondary'}
              size="sm"
              className={cn('shrink-0 gap-2 rounded-full px-4 text-sm', activeLeagueId !== league.id && 'text-muted-foreground')}
            >
              {league.logo_url && (
                <img src={league.logo_url} alt="" className="h-4 w-4 object-contain" />
              )}
              {league.short_name ?? league.name}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : !standingsData ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">Select a league to view standings.</p>
        </div>
      ) : (
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
                {standingsData.standings.map((row) => (
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
      )}
    </div>
  )
}
