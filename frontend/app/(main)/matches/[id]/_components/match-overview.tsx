'use client'

import { cn } from '@/lib/utils'
import type { Match } from '@/lib/api/domain'
import type { FormMatch } from '@/lib/api/domain'
import { useMatchForm } from '@/lib/api/hooks/fixtures.hooks'

// ─── Outcome badge ────────────────────────────────────────────────────────────

function outcome(match: FormMatch, teamId: string): 'W' | 'D' | 'L' {
  const isHome = match.home_team.id === teamId
  const scored   = isHome ? match.home_score : match.away_score
  const conceded = isHome ? match.away_score : match.home_score
  if (scored == null || conceded == null) return 'D'
  if (scored > conceded) return 'W'
  if (scored < conceded) return 'L'
  return 'D'
}

function ScoreBadge({ match, teamId }: { match: FormMatch; teamId: string }) {
  const result = outcome(match, teamId)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[12px] font-black tabular-nums',
        result === 'W' && 'bg-emerald-600 text-white',
        result === 'L' && 'bg-red-600    text-white',
        result === 'D' && 'bg-muted      text-muted-foreground',
      )}
    >
      {match.home_score} - {match.away_score}
    </span>
  )
}

// ─── Single team column ───────────────────────────────────────────────────────

function TeamFormColumn({
  team, matches, align,
}: {
  team: { id: string; name: string; short_name: string | null; logo_url: string | null }
  matches: FormMatch[]
  align: 'left' | 'right'
}) {
  if (matches.length === 0) {
    return (
      <div className="flex-1 text-center text-[12px] text-muted-foreground py-4">
        No recent results
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-2">
      {matches.map(m => {
        const isHome = m.home_team.id === team.id
        const opponent = isHome ? m.away_team : m.home_team
        const label = opponent.short_name ?? opponent.name

        return (
          <div
            key={m.id}
            className={cn(
              'flex items-center gap-2 text-[13px]',
              align === 'right' && 'flex-row-reverse',
            )}
          >
            <span className={cn('flex-1 truncate text-muted-foreground', align === 'right' && 'text-right')}>
              {isHome ? `${team.short_name ?? team.name}` : label}
            </span>
            <ScoreBadge match={m} teamId={team.id} />
            <span className={cn('flex-1 truncate text-muted-foreground', align === 'left' && 'text-right')}>
              {isHome ? label : `${team.short_name ?? team.name}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="h-3 w-24 rounded bg-muted animate-pulse mx-auto mb-5" />
      <div className="flex gap-6">
        {[0, 1].map(i => (
          <div key={i} className="flex-1 space-y-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded bg-muted animate-pulse" />
                <div className="w-12 h-5 rounded bg-muted animate-pulse" />
                <div className="flex-1 h-3 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Exported tab ─────────────────────────────────────────────────────────────

export function OverviewTab({ match }: { match: Match }) {
  const { data: form, isLoading } = useMatchForm(match.id)

  if (isLoading) return <FormSkeleton />
  if (!form || (form.home.length === 0 && form.away.length === 0)) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-[13px] text-muted-foreground">
        No recent match data available yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-[13px] font-black uppercase tracking-wide text-center mb-5">
        Team form
      </h2>
      <div className="flex gap-4">
        <TeamFormColumn team={match.home_team} matches={form.home} align="left" />
        <TeamFormColumn team={match.away_team} matches={form.away} align="right" />
      </div>
    </div>
  )
}
