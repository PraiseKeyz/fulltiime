'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Clock, Goal, RectangleVertical,
  ArrowLeftRight, Flag, ShieldHalf, Shield, CalendarDays,
} from 'lucide-react'
import { useFixture, useUpcomingFixtures } from '@/lib/api/hooks/fixtures.hooks'
import { cn, formatMatchDate, formatKickoff } from '@/lib/utils'
import type { Match, MatchEvent, MatchLineup, MatchStatistic, MatchPreview } from '@/lib/api/domain'
import { VenueCard, RoundFixturesCard, type RailFixture } from './_components/match-rail'

// ── Status helpers ─────────────────────────────────────────────────────────────

function statusLabel(match: Match): string {
  switch (match.status) {
    case 'LIVE':      return match.minute ? `${match.minute}'` : 'LIVE'
    case 'HALFTIME':  return 'HT'
    case 'FINISHED':  return 'FULL TIME'
    case 'POSTPONED': return 'POSTPONED'
    case 'CANCELLED': return 'CANCELLED'
    default:          return formatKickoff(match.kickoff_at)
  }
}

// ── Countdown ──────────────────────────────────────────────────────────────────

function useCountdown(kickoff: string) {
  const [diff, setDiff] = useState(new Date(kickoff).getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(kickoff).getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [kickoff])
  if (diff <= 0) return null
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  }
}

// ── Header ─────────────────────────────────────────────────────────────────────

function MatchHeader({ match }: { match: Match }) {
  const isLive  = match.status === 'LIVE' || match.status === 'HALFTIME'
  const hasScore = match.home_score !== null && match.away_score !== null
  const countdown = useCountdown(match.kickoff_at)
  const showCountdown = match.status === 'SCHEDULED' && countdown

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-6">
        <Link href="/matches" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ArrowLeft className="h-3.5 w-3.5" /> All Matches
        </Link>

        <div className="flex items-center justify-center gap-2 mb-5">
          {match.season?.league?.logo_url && (
            <img src={match.season.league.logo_url} alt="" className="h-5 w-5 object-contain" />
          )}
          <span className="text-[12px] font-bold uppercase tracking-wider text-primary">
            {match.season?.league?.name}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Home */}
          <div className="flex flex-col items-center gap-3">
            {match.home_team.logo_url
              ? <img src={match.home_team.logo_url} alt={match.home_team.name} className="h-16 w-16 object-contain" />
              : <div className="h-16 w-16 rounded-full bg-muted" />
            }
            <span className="text-[15px] font-bold text-center leading-tight">{match.home_team.name}</span>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            {showCountdown ? (
              <div className="text-center">
                <div className="flex items-center gap-1 text-xl font-black tabular-nums">
                  {countdown!.d > 0 && <span>{countdown!.d}d</span>}
                  <span>{String(countdown!.h).padStart(2, '0')}:{String(countdown!.m).padStart(2, '0')}:{String(countdown!.s).padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Until kick-off</p>
              </div>
            ) : (
              <span className={cn('text-5xl font-black tabular-nums', isLive && 'text-live')}>
                {hasScore ? `${match.home_score} – ${match.away_score}` : 'vs'}
              </span>
            )}
            <span className={cn(
              'text-[11px] font-black px-2.5 py-1 rounded-full',
              isLive ? 'bg-live/15 text-live' : 'bg-muted text-muted-foreground',
            )}>
              {isLive && <span className="inline-block h-1.5 w-1.5 rounded-full bg-live animate-pulse mr-1.5 align-middle" />}
              {statusLabel(match)}
            </span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-3">
            {match.away_team.logo_url
              ? <img src={match.away_team.logo_url} alt={match.away_team.name} className="h-16 w-16 object-contain" />
              : <div className="h-16 w-16 rounded-full bg-muted" />
            }
            <span className="text-[15px] font-bold text-center leading-tight">{match.away_team.name}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[11px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatMatchDate(match.kickoff_at)} · {formatKickoff(match.kickoff_at)}
          </span>
          {match.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {match.venue}
            </span>
          )}
          {match.referee && (
            <span className="flex items-center gap-1">
              <Flag className="h-3 w-3" /> {match.referee}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Event icon ─────────────────────────────────────────────────────────────────

function EventIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t.includes('goal'))         return <Goal className="h-4 w-4 text-foreground" />
  if (t.includes('yellow'))       return <RectangleVertical className="h-4 w-4 text-yellow-500 fill-yellow-500" />
  if (t.includes('red'))          return <RectangleVertical className="h-4 w-4 text-red-500 fill-red-500" />
  if (t.includes('substitution')) return <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
  return <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
}

// ── Summary (events) ───────────────────────────────────────────────────────────

function SummaryTab({ match }: { match: Match }) {
  const events = match.events ?? []

  if (match.status === 'SCHEDULED') {
    return <EmptyTab text="Match hasn't started yet. Events will appear here live." />
  }
  if (events.length === 0) {
    return <EmptyTab text="No key events recorded for this match." />
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

// ── Lineups ────────────────────────────────────────────────────────────────────

function PlayerRow({ player }: { player: MatchLineup }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="text-[11px] font-bold tabular-nums text-muted-foreground w-5 text-center shrink-0">
        {player.jersey_number ?? '–'}
      </span>
      {player.player_photo
        ? <img src={player.player_photo} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
        : <div className="h-6 w-6 rounded-full bg-muted shrink-0" />
      }
      <span className="text-[13px] font-medium truncate">{player.player_name}</span>
      {player.position && (
        <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase shrink-0">{player.position}</span>
      )}
    </div>
  )
}

function TeamLineup({
  teamName, logo, formation, starters, bench,
}: {
  teamName: string; logo: string | null; formation: string | null
  starters: MatchLineup[]; bench: MatchLineup[]
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/30">
        {logo && <img src={logo} alt="" className="h-5 w-5 object-contain" />}
        <span className="text-[13px] font-black">{teamName}</span>
        {formation && (
          <span className="ml-auto text-[11px] font-bold text-muted-foreground">{formation}</span>
        )}
      </div>
      <div className="px-4 py-2">
        {starters.map(p => <PlayerRow key={p.id} player={p} />)}
      </div>
      {bench.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Substitutes</p>
          {bench.map(p => <PlayerRow key={p.id} player={p} />)}
        </div>
      )}
    </div>
  )
}

function LineupsTab({ match }: { match: Match }) {
  const lineups = match.lineups ?? []

  if (lineups.length === 0) {
    const text = match.status === 'SCHEDULED'
      ? 'Line-ups are usually confirmed about an hour before kick-off.'
      : 'Line-ups are not available for this match.'
    return <EmptyTab text={text} />
  }

  const homeLineups = lineups.filter(l => l.team_id === match.home_team.id)
  const awayLineups = lineups.filter(l => l.team_id === match.away_team.id)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <TeamLineup
        teamName={match.home_team.name}
        logo={match.home_team.logo_url}
        formation={match.home_formation}
        starters={homeLineups.filter(l => l.is_starting)}
        bench={homeLineups.filter(l => !l.is_starting)}
      />
      <TeamLineup
        teamName={match.away_team.name}
        logo={match.away_team.logo_url}
        formation={match.away_formation}
        starters={awayLineups.filter(l => l.is_starting)}
        bench={awayLineups.filter(l => !l.is_starting)}
      />
    </div>
  )
}

// ── Stats ──────────────────────────────────────────────────────────────────────

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

function StatsTab({ match }: { match: Match }) {
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

  const available = rows.filter(r => r.h !== null || r.a !== null)

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

// ── Shared ─────────────────────────────────────────────────────────────────────

function EmptyTab({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <ShieldHalf className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">{text}</p>
    </div>
  )
}

type Tab = 'summary' | 'lineups' | 'stats'

// ── Preview (placeholder knockout fixtures, teams not yet known) ────────────────

function shortSlot(s: string | null): string {
  if (!s) return 'TBD'
  let m: RegExpMatchArray | null
  if ((m = s.match(/^(\d)(?:st|nd|rd|th) Group (.+)$/i)))          return `${m[1]}${m[2]}`
  if ((m = s.match(/^Winner Match (\d+)$/i)))                      return `W${m[1]}`
  if ((m = s.match(/^Winner (Quarter-final|Semi-final) (\d+)$/i))) return `W ${m[1].startsWith('Q') ? 'QF' : 'SF'}${m[2]}`
  if ((m = s.match(/^Loser (Quarter-final|Semi-final) (\d+)$/i)))  return `L ${m[1].startsWith('Q') ? 'QF' : 'SF'}${m[2]}`
  return s
}

function PreviewSide({ team, slot }: { team: MatchPreview['homeTeam']; slot: string | null }) {
  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {team?.logo
          ? <img src={team.logo} alt="" className="h-12 w-12 object-contain" />
          : <Shield className="h-8 w-8 text-muted-foreground/40" />}
      </div>
      <span className="text-[14px] font-bold text-center leading-tight" title={slot ?? undefined}>
        {team ? team.name : shortSlot(slot)}
      </span>
    </div>
  )
}

function MatchPreviewView({ preview }: { preview: MatchPreview }) {
  const dateStr = preview.date
    ? `${formatMatchDate(preview.date)} · ${formatKickoff(preview.date)}`
    : 'Date TBC'
  const home = preview.homeTeam ? preview.homeTeam.name : shortSlot(preview.homeSlot)
  const away = preview.awayTeam ? preview.awayTeam.name : shortSlot(preview.awaySlot)
  const venueName = preview.venue?.name

  const railFixtures: RailFixture[] = (preview.roundFixtures ?? []).map(t => ({
    id:        t.id,
    homeLabel: t.homeTeam?.name ?? shortSlot(t.homeSlot),
    homeLogo:  t.homeTeam?.logo ?? null,
    awayLabel: t.awayTeam?.name ?? shortSlot(t.awaySlot),
    awayLogo:  t.awayTeam?.logo ?? null,
    date:      t.date,
    isCurrent: t.id === preview.id,
  }))

  return (
    <div className="mx-auto max-w-[1100px] px-4 lg:px-6 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Main */}
      <div className="min-w-0 space-y-6">
        {/* Header card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <Link href="/matches" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors mb-5">
            <ArrowLeft className="h-3.5 w-3.5" /> Matches
          </Link>

          <div className="flex items-center justify-center gap-2 mb-6">
            {preview.league?.logo && <img src={preview.league.logo} alt="" className="h-5 w-5 object-contain" />}
            <span className="text-[12px] font-bold uppercase tracking-wider text-primary">
              {preview.league?.name}{preview.stage ? ` · ${preview.stage}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <PreviewSide team={preview.homeTeam} slot={preview.homeSlot} />
            <div className="text-center px-2">
              <div className="text-xl font-black">{preview.date ? formatKickoff(preview.date) : 'vs'}</div>
              {preview.date && <div className="text-[11px] text-muted-foreground mt-0.5">{formatMatchDate(preview.date)}</div>}
            </div>
            <PreviewSide team={preview.awayTeam} slot={preview.awaySlot} />
          </div>

          {venueName && (
            <div className="flex items-center justify-center gap-1 mt-6 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> {venueName}
            </div>
          )}
        </div>

        {/* About */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-[13px] font-black uppercase tracking-wide mb-3">About the match</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">{home}</span> faces{' '}
            <span className="text-foreground font-semibold">{away}</span>
            {venueName ? ` at ${venueName}` : ''} on {dateStr}, as part of the{' '}
            <span className="text-foreground font-semibold">{preview.league?.name}</span>
            {preview.stage ? ` ${preview.stage}` : ''}.
          </p>
          <p className="text-[13px] text-muted-foreground/80 leading-relaxed mt-3">
            The teams will be confirmed once the earlier rounds are played. Check back for line-ups,
            stats and live updates closer to kick-off.
          </p>
        </div>
      </div>

      {/* Rail */}
      <aside className="space-y-4">
        <VenueCard venue={preview.venue} />
        <RoundFixturesCard
          title={preview.league?.name ?? 'Competition'}
          subtitle={preview.stage}
          logo={preview.league?.logo}
          fixtures={railFixtures}
        />
      </aside>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const { data: match, isLoading } = useFixture(id)

  const urlTab = searchParams.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(urlTab ?? 'summary')

  // Reflect the active tab in the URL (?tab=…) so a reload restores it
  const selectTab = useCallback((value: Tab) => {
    setTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  const tabs = useMemo(() => ([
    { key: 'summary' as const, label: 'Summary' },
    { key: 'lineups' as const, label: 'Line-ups' },
    { key: 'stats'   as const, label: 'Stats' },
  ]), [])

  // For a real match, the rail shows the rest of that competition's fixtures
  const railLeagueId = match && !('preview' in match) ? match.season?.league?.id : undefined
  const { data: leagueFixtures } = useUpcomingFixtures(railLeagueId, 12)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[900px] px-4 lg:px-6 py-8 space-y-4">
        <div className="h-48 rounded-xl bg-card border border-border animate-pulse" />
        <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-[900px] px-4 lg:px-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">Match not found.</p>
        <Link href="/matches" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          Back to matches
        </Link>
      </div>
    )
  }

  // Placeholder knockout fixture (teams not yet known) → preview layout
  if ('preview' in match) {
    return <MatchPreviewView preview={match} />
  }

  const railFixtures: RailFixture[] = (leagueFixtures ?? []).map(m => ({
    id:        m.id,
    homeLabel: m.home_team.short_name ?? m.home_team.name,
    homeLogo:  m.home_team.logo_url,
    awayLabel: m.away_team.short_name ?? m.away_team.name,
    awayLogo:  m.away_team.logo_url,
    date:      m.kickoff_at,
    homeScore: m.home_score,
    awayScore: m.away_score,
    isCurrent: m.id === match.id,
  }))

  const league = match.season?.league

  return (
    <div className="mx-auto max-w-[1100px] px-4 lg:px-6 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Main */}
      <div className="min-w-0 space-y-6">
        <MatchHeader match={match} />

        <div>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-6">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => selectTab(t.key)}
                className={cn(
                  'px-5 py-2.5 text-[13px] font-bold transition-colors border-b-2 -mb-px',
                  tab === t.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'summary' && <SummaryTab match={match} />}
          {tab === 'lineups' && <LineupsTab match={match} />}
          {tab === 'stats'   && <StatsTab match={match} />}
        </div>
      </div>

      {/* Rail */}
      <aside className="space-y-4">
        <VenueCard venue={match.venue_ref ?? (match.venue ? { name: match.venue } : null)} />
        <RoundFixturesCard
          title={league?.name ?? 'Competition'}
          subtitle="Fixtures"
          logo={league?.logo_url}
          fixtures={railFixtures}
        />
      </aside>
    </div>
  )
}
