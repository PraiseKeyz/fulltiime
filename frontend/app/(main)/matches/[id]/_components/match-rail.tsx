'use client'

import Link from 'next/link'
import { MapPin, Shield } from 'lucide-react'
import { cn, formatMatchDate, formatKickoff } from '@/lib/utils'
import type { VenueInfo } from '@/lib/api/domain'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// ── Venue card ──────────────────────────────────────────────────────────────────

export function VenueCard({ venue }: { venue: VenueInfo | null | undefined }) {
  if (!venue?.name) return null
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-tight">{venue.name}</p>
          {venue.city && <p className="text-[11px] text-muted-foreground mt-0.5">{venue.city}</p>}
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
