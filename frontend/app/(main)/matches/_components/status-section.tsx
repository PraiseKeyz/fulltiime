import { LeagueSection } from './league-section'
import type { LeagueGroup } from './types'

export function SectionHeader({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <h2 className="text-[11px] font-black uppercase tracking-widest" style={{ color }}>
        {label}
      </h2>
      <span className="text-[11px] text-muted-foreground font-semibold">({count})</span>
    </div>
  )
}

// A full status section: header + league-grouped match cards.
export function StatusSection({
  label, color, count, groups,
}: {
  label: string
  color: string
  count: number
  groups: LeagueGroup[]
}) {
  if (groups.length === 0) return null
  return (
    <section>
      <SectionHeader label={label} color={color} count={count} />
      <div className="space-y-3">
        {groups.map(g => <LeagueSection key={g.leagueId} group={g} />)}
      </div>
    </section>
  )
}

export function EmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card p-16 text-center">
      <p className="text-muted-foreground text-sm">No matches found for this date.</p>
    </div>
  )
}

export function MatchListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
      ))}
    </div>
  )
}
