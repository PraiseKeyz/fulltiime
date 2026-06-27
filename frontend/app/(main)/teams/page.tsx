'use client'

import { useState, useEffect } from 'react'
import { Users, Search } from 'lucide-react'
import { useTeams } from '@/lib/api/hooks/teams.hooks'
import { TeamCard } from './_components/team-card'
import { TeamGridSkeleton } from './_components/team-grid-skeleton'

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
        <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6">
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
      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 py-6">
        {isLoading ? (
          <TeamGridSkeleton />
        ) : !teams?.length ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-[13px] text-muted-foreground">
              {debouncedSearch ? `No teams matching “${debouncedSearch}”.` : 'No teams found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {teams.map((team) => <TeamCard key={team.id} team={team} />)}
          </div>
        )}
      </div>
    </>
  )
}
