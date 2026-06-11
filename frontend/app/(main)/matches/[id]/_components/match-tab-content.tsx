import { Goal, RectangleVertical, ArrowLeftRight, ShieldHalf } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Match } from '@/lib/api/domain'
import type { MatchView } from './phase'
import { getTbdNarrative } from './match-narrative'
import { useMatchNarrative } from '@/lib/api/hooks/fixtures.hooks'
import { PitchLineups } from './match-pitch'

// ─── Shared empty state ──────────────────────────────────────────────────────

export function EmptyTab({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <ShieldHalf className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">{text}</p>
    </div>
  )
}

// ─── Narrative ───────────────────────────────────────────────────────────────

function NarrativeBody({ narrative }: { narrative: { intro: string; highlights: string[]; closing?: string } }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-[13px] font-black uppercase tracking-wide mb-3">About the match</h2>

      <p className="text-[14px] leading-relaxed text-muted-foreground">{narrative.intro}</p>

      {narrative.highlights.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {narrative.highlights.map((h, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground/80">
              <span className="mt-[7px] h-1 w-1 rounded-full bg-primary shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}

      {narrative.closing && (
        <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground/60 italic">{narrative.closing}</p>
      )}
    </div>
  )
}

function NarrativeSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
      <div className="h-3 w-28 rounded bg-muted animate-pulse" />
      <div className="h-3 w-full rounded bg-muted animate-pulse" />
      <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
      <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
    </div>
  )
}

// TBD placeholders have no real Match row — served from a static blurb. Every
// other phase is LLM-authored, generated once and cached forever (see
// docs/match-page-spec.md §5) — fetched lazily so the one-time generation
// latency only ever blocks the very first page view of that phase-text.
export function NarrativeTab({ view }: { view: MatchView }) {
  if (view.phase === 'tbd') {
    return <NarrativeBody narrative={getTbdNarrative(view)} />
  }

  const { data, isLoading } = useMatchNarrative(view.match.id)

  if (isLoading) return <NarrativeSkeleton />
  if (!data) return null

  return <NarrativeBody narrative={data} />
}

// ─── Summary (events) ────────────────────────────────────────────────────────

function EventIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t.includes('goal'))         return <Goal className="h-4 w-4 text-foreground" />
  if (t.includes('yellow'))       return <RectangleVertical className="h-4 w-4 text-yellow-500 fill-yellow-500" />
  if (t.includes('red'))          return <RectangleVertical className="h-4 w-4 text-red-500 fill-red-500" />
  if (t.includes('substitution')) return <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
  return <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
}

export function SummaryTab({ match }: { match: Match }) {
  const events = match.events ?? []

  if (events.length === 0) {
    const text = match.status === 'LIVE' || match.status === 'HALFTIME'
      ? 'No key events yet. Goals, cards and substitutions will appear here as they happen.'
      : 'No key events recorded for this match.'
    return <EmptyTab text={text} />
  }

  return (
    <div className="space-y-1">
      {events.map(ev => {
        const isHome = ev.team_id === match.home_team.id
        return (
          <div
            key={ev.id}
            className={cn(
              'flex items-center gap-3 py-2.5 px-3 rounded-lg',
              isHome ? 'flex-row' : 'flex-row-reverse text-right',
            )}
          >
            <span className="text-[12px] font-black tabular-nums text-muted-foreground w-8 shrink-0">
              {ev.minute}{ev.extra_minute ? `+${ev.extra_minute}` : ''}&apos;
            </span>
            <EventIcon type={ev.type} />
            <div className={cn('min-w-0', !isHome && 'items-end')}>
              <p className="text-[13px] font-semibold truncate">{ev.player_name ?? ev.type}</p>
              {ev.related_player_name && (
                <p className="text-[11px] text-muted-foreground truncate">↳ {ev.related_player_name}</p>
              )}
              {ev.detail && !ev.related_player_name && (
                <p className="text-[11px] text-muted-foreground truncate">{ev.detail}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Line-ups ────────────────────────────────────────────────────────────────

export function LineupsTab({ match }: { match: Match }) {
  const lineups = match.lineups ?? []

  if (lineups.length === 0) {
    const text = match.status === 'SCHEDULED'
      ? 'Line-ups are usually confirmed about an hour before kick-off.'
      : 'Line-ups are not available for this match.'
    return <EmptyTab text={text} />
  }

  return <PitchLineups match={match} />
}

// ─── Stats ───────────────────────────────────────────────────────────────────

function StatBar({ label, home, away, suffix = '' }: { label: string; home: number; away: number; suffix?: string }) {
  const total = home + away || 1
  const homeW = Math.round((home / total) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[12px] font-bold tabular-nums">
        <span>{home}{suffix}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
        <span>{away}{suffix}</span>
      </div>
      <div className="flex gap-0.5 h-1.5">
        <div className="flex flex-1 justify-end rounded-l-full overflow-hidden bg-border">
          <div className="bg-primary rounded-l-full" style={{ width: `${homeW}%` }} />
        </div>
        <div className="flex flex-1 rounded-r-full overflow-hidden bg-border">
          <div className="bg-muted-foreground/60 rounded-r-full" style={{ width: `${100 - homeW}%` }} />
        </div>
      </div>
    </div>
  )
}

/** Rows of the stats table that actually have a value — shared so the tab and the
 *  "should this tab exist" predicate agree. */
export function availableStatRows(match: Match) {
  const home = match.statistics?.find(s => s.team_id === match.home_team.id)
  const away = match.statistics?.find(s => s.team_id === match.away_team.id)

  const rows: { label: string; h: number | null; a: number | null; suffix?: string }[] = [
    { label: 'Possession',     h: home?.possession ?? null,      a: away?.possession ?? null,      suffix: '%' },
    { label: 'Shots',          h: home?.shots ?? null,           a: away?.shots ?? null },
    { label: 'Shots on Target',h: home?.shots_on_target ?? null, a: away?.shots_on_target ?? null },
    { label: 'Expected Goals', h: home?.xg ?? null,              a: away?.xg ?? null },
    { label: 'Corners',        h: home?.corners ?? null,         a: away?.corners ?? null },
    { label: 'Fouls',          h: home?.fouls ?? null,           a: away?.fouls ?? null },
    { label: 'Yellow Cards',   h: home?.yellow_cards ?? null,    a: away?.yellow_cards ?? null },
    { label: 'Red Cards',      h: home?.red_cards ?? null,       a: away?.red_cards ?? null },
  ]

  return rows.filter(r => r.h !== null || r.a !== null)
}

export function StatsTab({ match }: { match: Match }) {
  const available = availableStatRows(match)

  if (available.length === 0) {
    const text = match.status === 'SCHEDULED'
      ? 'Match statistics will be available once the game kicks off.'
      : 'No statistics available for this match.'
    return <EmptyTab text={text} />
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {available.map(r => (
        <StatBar key={r.label} label={r.label} home={r.h ?? 0} away={r.a ?? 0} suffix={r.suffix} />
      ))}
    </div>
  )
}
