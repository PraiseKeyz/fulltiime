import type { Player, PlayerPosition } from '@/lib/api/domain'
import { POSITION_LABEL } from './constants'

type SquadGroup = { position: PlayerPosition; players: Player[] }

export function SquadList({ squadByPosition }: { squadByPosition: SquadGroup[] }) {
  if (squadByPosition.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-[13px] text-muted-foreground">No squad information available yet.</p>
      </div>
    )
  }

  return (
    <>
      {squadByPosition.map(({ position, players }) => (
        <div key={position} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-[12px] font-black uppercase tracking-wide">{POSITION_LABEL[position]}</span>
          </div>
          <div className="divide-y divide-border">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-6 text-center text-[12px] font-mono tabular-nums text-muted-foreground shrink-0">
                  {player.number ?? '—'}
                </span>
                {player.photo_url ? (
                  <img src={player.photo_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                )}
                <span className="text-[13px] font-semibold truncate">{player.name}</span>
                {player.nationality && (
                  <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{player.nationality}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
