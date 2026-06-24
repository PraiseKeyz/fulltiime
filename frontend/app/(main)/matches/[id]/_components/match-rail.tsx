'use client'

import Link from 'next/link'
import { MapPin, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTimeFormat } from '@/lib/hooks/use-time-format'
import type { Match, MatchPreview, VenueInfo } from '@/lib/api/domain'
import { useLiveFixtures, useUpcomingFixtures } from '@/lib/api/hooks/fixtures.hooks'
import { useImmersive } from '@/providers/immersive-provider'
import type { MatchView } from './phase'
import { getViewMeta } from './view-meta'
import { shortSlot } from './labels'
import { fullchatAvailable } from './phase.config'
import { LiveChatTab } from './live-chat-tab'
import { useMediaQuery } from '@/lib/hooks/use-media-query'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// ── Venue card ──────────────────────────────────────────────────────────────────

export function VenueCard({ venue, className }: { venue: VenueInfo | null | undefined; className?: string }) {
  if (!venue?.name) return null
  const location = [venue.city, venue.country].filter(Boolean).join(', ')
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      {/* Stadium photo */}
      {venue.image_url && (
        <div className="h-28 bg-muted overflow-hidden">
          <img src={venue.image_url} alt={venue.name ?? ''} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-tight">{venue.name}</p>
            {location && <p className="text-[11px] text-muted-foreground mt-0.5">{location}</p>}
          </div>
        </div>
        {(venue.capacity != null || venue.surface) && (
          <div className="border-t border-border pt-3 space-y-1.5">
            {venue.capacity != null && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-semibold tabular-nums">{venue.capacity.toLocaleString()}</span>
              </div>
            )}
            {venue.surface && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Surface</span>
                <span className="font-semibold">{cap(venue.surface)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Round fixtures card ─────────────────────────────────────────────────────────

export interface RailFixture {
  id:         string | number
  homeLabel:  string
  homeLogo:   string | null
  awayLabel:  string
  awayLogo:   string | null
  date:       string | null
  homeScore?: number | null
  awayScore?: number | null
  isCurrent?: boolean
}

function Side({ label, logo }: { label: string; logo: string | null }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {logo
        ? <img src={logo} alt="" className="h-4 w-4 object-contain shrink-0" />
        : <Shield className="h-4 w-4 text-muted-foreground/30 shrink-0" />}
      <span className="text-[12px] font-semibold truncate">{label}</span>
    </div>
  )
}

function RailRow({ f }: { f: RailFixture }) {
  const { formatMatchDate, formatKickoff } = useTimeFormat()
  const hasScore = f.homeScore != null && f.awayScore != null
  return (
    <Link
      href={`/matches/${f.id}`}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 transition-colors',
        f.isCurrent ? 'bg-muted/60' : 'hover:bg-muted/40',
      )}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <Side label={f.homeLabel} logo={f.homeLogo} />
        <Side label={f.awayLabel} logo={f.awayLogo} />
      </div>
      <div className="shrink-0 text-right">
        {hasScore ? (
          <div className="text-[12px] font-black tabular-nums leading-tight">
            <div>{f.homeScore}</div>
            <div>{f.awayScore}</div>
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground leading-tight">
            <div>{f.date ? formatMatchDate(f.date) : ''}</div>
            <div>{f.date ? formatKickoff(f.date) : ''}</div>
          </div>
        )}
      </div>
    </Link>
  )
}

export function RoundFixturesCard({
  title, subtitle, logo, fixtures,
}: {
  title:     string
  subtitle?: string | null
  logo?:     string | null
  fixtures:  RailFixture[]
}) {
  if (fixtures.length === 0) return null
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div className="min-w-0">
          <p className="text-[13px] font-black truncate">{title}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{subtitle}</p>}
        </div>
        {logo && <img src={logo} alt="" className="h-6 w-6 object-contain shrink-0" />}
      </div>
      <div className="divide-y divide-border max-h-[520px] overflow-y-auto scrollbar-none">
        {fixtures.map(f => <RailRow key={f.id} f={f} />)}
      </div>
    </div>
  )
}

// ── Phase-specific rail ───────────────────────────────────────────────────────
function TbdRail({ preview }: { preview: MatchPreview }) {
  const fixtures: RailFixture[] = (preview.roundFixtures ?? []).map(t => ({
    id:        t.id,
    homeLabel: t.homeTeam?.name ?? shortSlot(t.homeSlot),
    homeLogo:  t.homeTeam?.logo ?? null,
    awayLabel: t.awayTeam?.name ?? shortSlot(t.awaySlot),
    awayLogo:  t.awayTeam?.logo ?? null,
    date:      t.date,
    isCurrent: t.id === preview.id,
  }))
  return (
    <RoundFixturesCard
      title={preview.league?.name ?? 'Competition'}
      subtitle={preview.stage ?? 'Round'}
      logo={preview.league?.logo}
      fixtures={fixtures}
    />
  )
}

function LiveRail({ match }: { match: Match }) {
  const { data } = useLiveFixtures()
  const others = (data ?? []).filter(m => m.id !== match.id)
  if (others.length === 0) return <LeagueRail match={match} />
  const fixtures: RailFixture[] = others.map(m => toRailFixture(m))
  return <RoundFixturesCard title="Live Now" subtitle="In play" fixtures={fixtures} />
}

/** UPCOMING / FINISHED / DISRUPTED — the rest of this competition's fixtures. */
function LeagueRail({ match }: { match: Match }) {
  const leagueId = match.season?.league?.id
  const league   = match.season?.league
  const { data } = useUpcomingFixtures(leagueId, 12)
  const fixtures: RailFixture[] = (data ?? []).map(m => toRailFixture(m, match.id))
  return (
    <RoundFixturesCard
      title={league?.name ?? 'Competition'}
      subtitle="Fixtures"
      logo={league?.logo_url}
      fixtures={fixtures}
    />
  )
}

function toRailFixture(m: Match, currentId?: string): RailFixture {
  return {
    id:        m.id,
    homeLabel: m.home_team.short_name ?? m.home_team.name,
    homeLogo:  m.home_team.logo_url,
    awayLabel: m.away_team.short_name ?? m.away_team.name,
    awayLogo:  m.away_team.logo_url,
    date:      m.kickoff_at,
    homeScore: m.home_score,
    awayScore: m.away_score,
    isCurrent: currentId ? m.id === currentId : false,
  }
}

function RailSlot2({ view }: { view: MatchView }) {
  switch (view.phase) {
    case 'tbd':  return <TbdRail preview={view.preview} />
    case 'live': return <LiveRail match={view.match} />
    default:     return <LeagueRail match={view.match} />
  }
}

export function MatchRail({ view }: { view: MatchView }) {
  const { venue } = getViewMeta(view)
  const { immersive } = useImmersive()
  // Mobile already has Fullchat as its own tab (with the fullscreen takeover) —
  // showing it again, stacked below the rail, would just be a confusing duplicate.
  // Only the permanent desktop sidebar should ever swap fixtures for chat.
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  if (immersive) return null

  // The navbar's own sticky box now covers the gap down to here (see
  // navbar.tsx), so this just needs the standard offset every other page
  // uses — matches the main column's hero wrapper in page.tsx.
  if (view.phase === 'tbd') {
    return (
      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <VenueCard venue={venue} className="lg:h-64" />
        <RailSlot2 view={view} />
      </aside>
    )
  }

  const showChat = isDesktop && fullchatAvailable(view)

  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start lg:flex lg:h-[calc(100vh-7rem)] lg:flex-col lg:gap-4 lg:space-y-0">
      <VenueCard venue={venue} className="lg:h-64 lg:shrink-0" />
      {showChat ? (
        <div className="h-[530px] overflow-hidden rounded-xl border border-border lg:h-auto lg:flex-1">
          <LiveChatTab match={view.match} />
        </div>
      ) : (
        <div className="lg:flex-1 lg:min-h-0">
          <RailSlot2 view={view} />
        </div>
      )}
    </aside>
  )
}
