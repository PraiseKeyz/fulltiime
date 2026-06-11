import { MatchCard } from '@/components/fixtures/match-card'
import type { Match } from '@/lib/api/domain'

export function RecentFixtures({ fixtures }: { fixtures: Match[] | undefined }) {
  return (
    <div className="space-y-3">
      <h2 className="text-[12px] font-black uppercase tracking-wide text-muted-foreground">Recent Fixtures</h2>
      {fixtures && fixtures.length > 0 ? (
        fixtures.map((match) => <MatchCard key={match.id} match={match} />)
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-[13px] text-muted-foreground">No fixtures available.</p>
        </div>
      )}
    </div>
  )
}
