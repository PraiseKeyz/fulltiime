'use client'

import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type TransferType = 'DONE DEAL' | 'CONFIRMED' | 'RUMOUR'
type Filter = 'ALL' | 'DONE DEAL' | 'CONFIRMED' | 'RUMOUR'

interface Transfer {
  id: string; player: string; position: string; age: number; type: TransferType
  fromClub: string; toClub: string; fee: string; dealType: string; updated: string; image: string
}

const TYPE_STYLES: Record<TransferType, { label: string; bg: string; text: string }> = {
  'DONE DEAL': { label: 'DONE DEAL', bg: 'bg-primary',    text: 'text-black' },
  'CONFIRMED': { label: 'CONFIRMED', bg: 'bg-blue-500',   text: 'text-white' },
  'RUMOUR':    { label: 'RUMOUR',    bg: 'bg-orange-500', text: 'text-white' },
}

const STAT_COLORS: Record<string, string> = {
  'DONE DEALS': 'text-primary',
  'CONFIRMED':  'text-blue-500',
  'RUMOURS':    'text-orange-500',
}

const TRANSFERS: Transfer[] = [
  { id: '1', player: 'Erling Haaland', position: 'Striker', age: 24, type: 'RUMOUR', fromClub: 'Man City', toClub: 'Real Madrid', fee: '€180M', dealType: 'Permanent', updated: '2 hr ago', image: '' },
  { id: '2', player: 'Florian Wirtz', position: 'Attacking Midfielder', age: 21, type: 'DONE DEAL', fromClub: 'Leverkusen', toClub: 'Bayern Munich', fee: '€130M', dealType: 'Permanent', updated: '5 hr ago', image: '' },
  { id: '3', player: 'Victor Osimhen', position: 'Striker', age: 26, type: 'CONFIRMED', fromClub: 'Napoli', toClub: 'PSG', fee: '€110M', dealType: 'Permanent', updated: '1 day ago', image: '' },
  { id: '4', player: 'Jamal Musiala', position: 'Midfielder', age: 22, type: 'RUMOUR', fromClub: 'Bayern Munich', toClub: 'Liverpool', fee: '€95M', dealType: 'Permanent', updated: '1 day ago', image: '' },
  { id: '5', player: 'João Neves', position: 'Defensive Mid', age: 20, type: 'CONFIRMED', fromClub: 'Benfica', toClub: 'Man City', fee: '€75M', dealType: 'Permanent', updated: '2 days ago', image: '' },
  { id: '6', player: 'Rafael Leão', position: 'Winger', age: 25, type: 'RUMOUR', fromClub: 'AC Milan', toClub: 'Chelsea', fee: '€90M', dealType: 'Permanent', updated: '3 days ago', image: '' },
]

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' }, { label: 'Done Deal', value: 'DONE DEAL' },
  { label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Rumour', value: 'RUMOUR' },
]

const STATS = [
  { count: TRANSFERS.filter(t => t.type === 'DONE DEAL').length, label: 'DONE DEALS' },
  { count: TRANSFERS.filter(t => t.type === 'CONFIRMED').length, label: 'CONFIRMED' },
  { count: TRANSFERS.filter(t => t.type === 'RUMOUR').length,    label: 'RUMOURS' },
]

function ClubLogo({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
      <span className="text-[9px] font-black text-muted-foreground">{initials}</span>
    </div>
  )
}

function TransferCard({ transfer }: { transfer: Transfer }) {
  const style = TYPE_STYLES[transfer.type]
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors">
      <div className="relative h-40 bg-muted flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
          <Zap className="h-10 w-10 text-muted-foreground/20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span className={cn('absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-black tracking-wider', style.bg, style.text)}>
          {style.label}
        </span>
        <div className="relative px-4 pb-3">
          <p className="text-[16px] font-black text-white leading-tight">{transfer.player}</p>
          <p className="text-[11px] text-white/60">{transfer.position} · {transfer.age}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-4 px-4 border-b border-border">
        <div className="flex flex-col items-center gap-1.5">
          <ClubLogo name={transfer.fromClub} />
          <span className="text-[11px] text-muted-foreground font-semibold">{transfer.fromClub}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-primary shrink-0" />
        <div className="flex flex-col items-center gap-1.5">
          <ClubLogo name={transfer.toClub} />
          <span className="text-[11px] text-muted-foreground font-semibold">{transfer.toClub}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border py-3">
        <div className="flex flex-col items-center gap-0.5 px-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fee</span>
          <span className="text-[15px] font-black">{transfer.fee}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</span>
          <span className="text-[13px] font-bold">{transfer.dealType}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Updated</span>
          <span className="text-[13px] font-semibold">{transfer.updated}</span>
        </div>
      </div>
    </div>
  )
}

export function TransfersTab() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const filtered = filter === 'ALL' ? TRANSFERS : TRANSFERS.filter(t => t.type === filter)

  return (
    <div className="space-y-6">
      {/* Stat boxes */}
      <div className="flex items-center gap-3 flex-wrap">
        {STATS.map(({ count, label }) => (
          <div key={label} className="flex flex-col gap-0.5 rounded-lg border border-border bg-card px-5 py-3 min-w-[110px]">
            <span className={cn('text-[28px] font-black leading-none', STAT_COLORS[label])}>{count}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <Button
            key={f.value}
            onClick={() => setFilter(f.value)}
            variant={filter === f.value ? 'primary' : 'outline'}
            size="sm"
            className={cn('rounded-full px-5 text-[12px]', filter !== f.value && 'text-muted-foreground')}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(t => <TransferCard key={t.id} transfer={t} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm">No transfers found.</div>
      )}
    </div>
  )
}
