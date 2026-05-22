'use client'

import { useState } from 'react'
import { useTeams } from '@/lib/api/hooks/teams.hooks'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function TeamsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data: teams, isLoading } = useTeams({ search: debouncedSearch || undefined })

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    clearTimeout((window as any).__teamSearchTimer)
    ;(window as any).__teamSearchTimer = setTimeout(() => {
      setDebouncedSearch(e.target.value)
    }, 400)
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Teams</h1>

      <input
        type="search"
        placeholder="Search teams..."
        value={search}
        onChange={handleSearch}
        className="w-full max-w-sm mb-6 rounded-lg border border-border bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !teams?.length ? (
        <p className="text-muted-foreground text-sm">No teams found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors text-center"
            >
              {team.logo_url ? (
                <img src={team.logo_url} alt={team.name} className="h-14 w-14 object-contain" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">{team.code ?? team.name.slice(0, 3).toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{team.name}</p>
                {team.country && (
                  <p className="text-xs text-muted-foreground mt-0.5">{team.country.name}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
