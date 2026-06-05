'use client'

import { useState, useEffect } from 'react'
import { Users, Search } from 'lucide-react'
import Link from 'next/link'
import { useTeams } from '@/lib/api/hooks/teams.hooks'

export default function TeamsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data: teams, isLoading } = useTeams({ search: debouncedSearch || undefined })

  return (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-black uppercase tracking-wide">Teams</h1>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl border border-border bg-muted animate-pulse" />
            ))}
          </div>
        ) : !teams?.length ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-[13px] text-muted-foreground">
              {debouncedSearch ? `No teams matching “${debouncedSearch}”.` : 'No teams found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors text-center"
              >
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="h-14 w-14 object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">
                      {team.code ?? team.name.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[13px] leading-tight truncate w-full">{team.name}</p>
                  {team.country && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{team.country.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
