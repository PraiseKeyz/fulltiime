import { cn } from '@/lib/utils'
import type { Match, MatchLineup, TeamSummary } from '@/lib/api/domain'

// ─── Formation grid placement ────────────────────────────────────────────────

const ROW_FROM_POSITION: Record<string, number> = {
  goalkeeper: 1,
  defender: 2,
  midfielder: 3,
  attacker: 4,
  forward: 4,
}

function parseFormationField(field: string | null) {
  if (!field) return null
  const [row, slot] = field.split(':').map(Number)
  if (!Number.isFinite(row) || !Number.isFinite(slot)) return null
  return { row, slot }
}

interface PlacedPlayer {
  player: MatchLineup
  x: number
  yFrac: number
}

function placeOnGrid(starters: MatchLineup[]): PlacedPlayer[] {
  const rows = new Map<number, MatchLineup[]>()

  for (const player of starters) {
    const parsed = parseFormationField(player.formation_field)
    const row = parsed?.row ?? ROW_FROM_POSITION[(player.position ?? '').toLowerCase()] ?? 3
    if (!rows.has(row)) rows.set(row, [])
    rows.get(row)!.push(player)
  }

  for (const players of rows.values()) {
    players.sort(
      (a, b) => (parseFormationField(a.formation_field)?.slot ?? 0) - (parseFormationField(b.formation_field)?.slot ?? 0),
    )
  }

  const sortedRows = [...rows.keys()].sort((a, b) => a - b)
  const maxRow = sortedRows[sortedRows.length - 1] ?? 1

  return sortedRows.flatMap((row) => {
    const players = rows.get(row)!
    return players.map((player, i) => ({
      player,
      x: ((i + 1) / (players.length + 1)) * 100,
      yFrac: maxRow === 1 ? 0 : (row - 1) / (maxRow - 1),
    }))
  })
}

// ─── Pitch markings ──────────────────────────────────────────────────────────

function PitchMarkings() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-2 sm:inset-3 rounded-sm border-2 border-white/25" />
      <div className="absolute left-2 right-2 sm:left-3 sm:right-3 top-1/2 border-t-2 border-white/25" />
      <div className="absolute left-1/2 top-1/2 h-[20%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25" />
      {/* Away penalty area + six-yard box (top) */}
      <div className="absolute left-1/2 top-2 sm:top-3 h-[16%] w-[60%] -translate-x-1/2 border-2 border-t-0 border-white/25" />
      <div className="absolute left-1/2 top-2 sm:top-3 h-[7%] w-[30%] -translate-x-1/2 border-2 border-t-0 border-white/25" />
      {/* Home penalty area + six-yard box (bottom) */}
      <div className="absolute left-1/2 bottom-2 sm:bottom-3 h-[16%] w-[60%] -translate-x-1/2 border-2 border-b-0 border-white/25" />
      <div className="absolute left-1/2 bottom-2 sm:bottom-3 h-[7%] w-[30%] -translate-x-1/2 border-2 border-b-0 border-white/25" />
    </div>
  )
}

// ─── Player token ─────────────────────────────────────────────────────────────

function PlayerToken({ player, x, y, side }: { player: MatchLineup; x: number; y: number; side: 'home' | 'away' }) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative">
        {player.player_photo ? (
          <img
            src={player.player_photo}
            alt=""
            className="h-9 w-9 sm:h-12 sm:w-12 rounded-full border-2 border-white/90 bg-card object-cover shadow-md"
          />
        ) : (
          <div
            className={cn(
              'flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white/90 text-[12px] font-black shadow-md',
              side === 'home' ? 'bg-card text-foreground' : 'bg-foreground text-background',
            )}
          >
            {player.jersey_number ?? '–'}
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-white/70 bg-black/80 text-[9px] font-black text-white">
          {player.jersey_number ?? '–'}
        </span>
      </div>
      <span className="max-w-[60px] truncate rounded bg-black/55 px-1 py-0.5 text-[9px] font-bold leading-tight text-white sm:max-w-[80px] sm:text-[10px]">
        {player.player_name}
      </span>
    </div>
  )
}

// ─── Team label ───────────────────────────────────────────────────────────────

function TeamLabel({ team, formation, align }: { team: TeamSummary; formation: string | null; align: 'left' | 'right' }) {
  return (
    <div className={cn('flex items-center gap-2', align === 'right' && 'flex-row-reverse text-right')}>
      {team.logo_url && <img src={team.logo_url} alt="" className="h-6 w-6 object-contain" />}
      <div>
        <p className="text-[12px] sm:text-[13px] font-black leading-tight">{team.name}</p>
        {formation && <p className="text-[10px] font-bold text-muted-foreground">{formation}</p>}
      </div>
    </div>
  )
}

// ─── Substitutes ──────────────────────────────────────────────────────────────

function BenchRow({ player }: { player: MatchLineup }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="w-5 shrink-0 text-center text-[11px] font-bold tabular-nums text-muted-foreground">
        {player.jersey_number ?? '–'}
      </span>
      {player.player_photo
        ? <img src={player.player_photo} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
        : <div className="h-6 w-6 shrink-0 rounded-full bg-muted" />}
      <span className="truncate text-[13px] font-medium">{player.player_name}</span>
      {player.position && (
        <span className="ml-auto shrink-0 text-[10px] font-bold uppercase text-muted-foreground">{player.position}</span>
      )}
    </div>
  )
}

function BenchCard({ teamName, bench }: { teamName: string; bench: MatchLineup[] }) {
  if (bench.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {teamName} · Substitutes
      </p>
      {bench.map((p) => <BenchRow key={p.id} player={p} />)}
    </div>
  )
}

// ─── Pitch ────────────────────────────────────────────────────────────────────

export function PitchLineups({ match }: { match: Match }) {
  const lineups = match.lineups ?? []

  const homeStarters = lineups.filter((l) => l.team_id === match.home_team.id && l.is_starting)
  const awayStarters = lineups.filter((l) => l.team_id === match.away_team.id && l.is_starting)
  const homeBench = lineups.filter((l) => l.team_id === match.home_team.id && !l.is_starting)
  const awayBench = lineups.filter((l) => l.team_id === match.away_team.id && !l.is_starting)

  const homePlaced = placeOnGrid(homeStarters)
  const awayPlaced = placeOnGrid(awayStarters)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <TeamLabel team={match.home_team} formation={match.home_formation} align="left" />
          <TeamLabel team={match.away_team} formation={match.away_formation} align="right" />
        </div>

        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg sm:aspect-[4/5]">
          <PitchMarkings />
          {homePlaced.map(({ player, x, yFrac }) => (
            <PlayerToken key={player.id} player={player} x={x} y={96 - yFrac * 46} side="home" />
          ))}
          {awayPlaced.map(({ player, x, yFrac }) => (
            <PlayerToken key={player.id} player={player} x={x} y={4 + yFrac * 46} side="away" />
          ))}
        </div>
      </div>

      {(homeBench.length > 0 || awayBench.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          <BenchCard teamName={match.home_team.name} bench={homeBench} />
          <BenchCard teamName={match.away_team.name} bench={awayBench} />
        </div>
      )}
    </div>
  )
}
