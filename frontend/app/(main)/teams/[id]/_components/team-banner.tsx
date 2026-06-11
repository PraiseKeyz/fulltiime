import Link from 'next/link'
import { ArrowLeft, Shield, MapPin, Calendar, Flag } from 'lucide-react'
import type { Team } from '@/lib/api/domain'

export function TeamBanner({ team }: { team: Team }) {
  return (
    <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] border-b border-border">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative mx-auto max-w-[1400px] px-4 lg:px-6 py-8">
        <Link href="/teams" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors mb-5">
          <ArrowLeft className="h-3.5 w-3.5" /> All Teams
        </Link>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {team.logo_url
              ? <img src={team.logo_url} alt={team.name} className="h-11 w-11 object-contain" />
              : <Shield className="h-8 w-8 text-white/50" />
            }
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wide leading-tight">
              {team.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/70 mt-1.5">
              {team.country && (
                <span className="inline-flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5" /> {team.country.name}
                </span>
              )}
              {team.founded && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Est. {team.founded}
                </span>
              )}
              {team.stadium && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {team.stadium}
                  {team.venue_city && `, ${team.venue_city}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
