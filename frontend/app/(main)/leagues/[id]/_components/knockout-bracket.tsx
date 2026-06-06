'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Trophy, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Bracket, BracketTie, BracketEdge } from '@/lib/api/domain'

// ── Helpers ────────────────────────────────────────────────────────────────────

function shortSlot(s: string | null): string {
  if (!s) return 'TBD'
  let m: RegExpMatchArray | null
  if ((m = s.match(/^(\d)(?:st|nd|rd|th) Group (.+)$/i)))          return `${m[1]}${m[2]}`
  if ((m = s.match(/^Winner Match (\d+)$/i)))                      return `W${m[1]}`
  if ((m = s.match(/^Winner (Quarter-final|Semi-final) (\d+)$/i))) return `W ${m[1].startsWith('Q') ? 'QF' : 'SF'}${m[2]}`
  if ((m = s.match(/^Loser (Quarter-final|Semi-final) (\d+)$/i)))  return `L ${m[1].startsWith('Q') ? 'QF' : 'SF'}${m[2]}`
  return s
}

function fmtDate(d: string | null): string {
  if (!d) return ''
  return new Date(d.replace(' ', 'T')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function roundTag(stageName: string): string {
  const n = stageName.toLowerCase()
  if (n.includes('32')) return 'R32'
  if (n.includes('16')) return 'R16'
  if (n.includes('quarter')) return 'QF'
  if (n.includes('semi')) return 'SF'
  if (n.includes('3rd') || n.includes('third') || n.includes('place')) return '3rd'
  if (n.includes('final')) return 'F'
  return ''
}

// ── Tie card ───────────────────────────────────────────────────────────────────

// One competitor — flag/crest on top, code (or team name) below.
function Competitor({ team, slot }: { team: BracketTie['homeTeam']; slot: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
      {team?.logo
        ? <img src={team.logo} alt="" className="h-6 w-6 object-contain shrink-0" />
        : <Shield className="h-6 w-6 text-muted-foreground/30 shrink-0" />}
      <span className="text-[10px] font-bold truncate max-w-full" title={team?.name ?? slot ?? undefined}>
        {team ? team.name : shortSlot(slot)}
      </span>
    </div>
  )
}

function TieCardInner({ tie, round }: { tie: BracketTie; round: string }) {
  return (
    <>
      <div className="flex items-center justify-between px-2.5 pt-1.5">
        <span className="text-[8px] font-black uppercase tracking-wide text-muted-foreground/60">{round}</span>
        <span className="text-[8px] text-muted-foreground/60">{fmtDate(tie.date)}</span>
      </div>
      <div className="flex items-start gap-1.5 px-2.5 pb-2 pt-1">
        <Competitor team={tie.homeTeam} slot={tie.homeSlot} />
        <span className="text-[9px] font-bold text-muted-foreground/50 self-center">v</span>
        <Competitor team={tie.awayTeam} slot={tie.awaySlot} />
      </div>
    </>
  )
}

function TieCard({ tie, round }: { tie: BracketTie; round: string }) {
  // Every tie links to the match page. Real fixtures → full match; placeholders
  // → a preview page (resolved by the SportMonks fixture id).
  return (
    <Link
      href={`/matches/${tie.id}`}
      className="w-[132px] shrink-0 rounded-md border border-border bg-card overflow-hidden block hover:border-primary/50 transition-colors"
    >
      <TieCardInner tie={tie} round={round} />
    </Link>
  )
}

// Full-width variant used by the mobile (vertical) layout.
function TieCardMobile({ tie, round }: { tie: BracketTie; round: string }) {
  return (
    <Link
      href={`/matches/${tie.id}`}
      className="block rounded-md border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
    >
      <TieCardInner tie={tie} round={round} />
    </Link>
  )
}

// ── Mobile (vertical) layout ─────────────────────────────────────────────────────

// Outer rounds first, working in towards the final.
const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', 'F', '3rd']
function roundIdx(stageName: string): number {
  const i = ROUND_ORDER.indexOf(roundTag(stageName))
  return i === -1 ? ROUND_ORDER.length : i
}

function StageHeading({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">{name}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

// ── Connector (mirror flips it horizontally) ────────────────────────────────────

function Connector({ mirror }: { mirror?: boolean }) {
  // Non-mirror: parents on the LEFT, card on the RIGHT.
  // Mirror:     card on the LEFT, parents on the RIGHT.
  const outer = mirror ? 'right-0' : 'left-0'
  const mid   = mirror ? 'right-1/2' : 'left-1/2'
  const toCard = mirror ? 'left-0 right-1/2' : 'left-1/2 right-0'
  return (
    <div className="relative self-stretch w-4 shrink-0">
      <span className={cn('absolute w-1/2 border-t border-border', outer, 'top-1/4')} />
      <span className={cn('absolute w-1/2 border-t border-border', outer, 'top-3/4')} />
      <span className={cn('absolute h-1/2 border-l border-border', mid, 'top-1/4')} />
      <span className={cn('absolute border-t border-border top-1/2', toCard)} />
    </div>
  )
}

// ── Recursive half ──────────────────────────────────────────────────────────────

interface NodeCtx {
  byId:    Map<number, BracketTie>
  stageOf: Map<number, string>
  edges:   BracketEdge[]
}

function parentsOf(tieId: number, edges: BracketEdge[]) {
  return {
    home: edges.find(e => e.child === tieId && e.childSlot === 'home')?.parent,
    away: edges.find(e => e.child === tieId && e.childSlot === 'away')?.parent,
  }
}

function BracketNode({ tieId, mirror, ctx }: { tieId: number; mirror: boolean; ctx: NodeCtx }) {
  const tie = ctx.byId.get(tieId)
  if (!tie) return null

  const round = roundTag(ctx.stageOf.get(tieId) ?? '')
  const { home, away } = parentsOf(tieId, ctx.edges)

  if (home == null && away == null) {
    return <TieCard tie={tie} round={round} /> // leaf (outer knockout round)
  }

  const parents = (
    <div className="flex flex-col justify-center gap-5">
      {home != null && <BracketNode tieId={home} mirror={mirror} ctx={ctx} />}
      {away != null && <BracketNode tieId={away} mirror={mirror} ctx={ctx} />}
    </div>
  )
  const card = <TieCard tie={tie} round={round} />

  return (
    <div className="flex items-center">
      {mirror
        ? <>{card}<Connector mirror />{parents}</>
        : <>{parents}<Connector />{card}</>}
    </div>
  )
}

// ── Bracket ─────────────────────────────────────────────────────────────────────

export function KnockoutBracket({ bracket }: { bracket: Bracket }) {
  const { ctx, finalTie, thirdTie, leftRoot, rightRoot, feederStages } = useMemo(() => {
    const byId    = new Map<number, BracketTie>()
    const stageOf = new Map<number, string>()
    for (const s of bracket.stages) {
      for (const t of s.ties) { byId.set(t.id, t); stageOf.set(t.id, s.name) }
    }
    // Match the Final exactly — "Quarter-finals" / "Semi-finals" also contain "final",
    // so a substring test would wrongly root the tree at a quarter-final.
    const finalStage = bracket.stages.find(s => s.name.trim().toLowerCase() === 'final')
    const thirdStage = bracket.stages.find(s => /3rd|third|place/i.test(s.name))
    const finalTie = finalStage?.ties[0] ?? null
    const { home, away } = finalTie ? parentsOf(finalTie.id, bracket.edges) : { home: undefined, away: undefined }
    // Mobile lays the rounds out vertically — every stage except the final & 3rd-place
    // (those get rendered on their own below), ordered outermost round first.
    const feederStages = bracket.stages
      .filter(s => s !== finalStage && s !== thirdStage)
      .sort((a, b) => roundIdx(a.name) - roundIdx(b.name))
    return {
      ctx: { byId, stageOf, edges: bracket.edges } as NodeCtx,
      finalTie,
      thirdTie: thirdStage?.ties[0] ?? null,
      leftRoot:  home ?? null,
      rightRoot: away ?? null,
      feederStages,
    }
  }, [bracket])

  if (!finalTie) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-[13px] text-muted-foreground">Knockout bracket isn’t available for this competition yet.</p>
      </div>
    )
  }

  const finalRound = roundTag(ctx.stageOf.get(finalTie.id) ?? 'Final')

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex items-center justify-center min-w-full gap-2">

        {/* Left half */}
        {leftRoot != null && <BracketNode tieId={leftRoot} mirror={false} ctx={ctx} />}

        {/* Center: final + champion + 3rd place */}
        <div className="flex flex-col items-center justify-center gap-2 px-1.5 shrink-0">
          <TieCard tie={finalTie} round={finalRound} />
          <div className="w-[132px] rounded-md border border-primary/30 bg-primary/[0.04] p-2.5 text-center">
            <Trophy className="h-5 w-5 text-primary mx-auto mb-0.5" />
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Champion</p>
          </div>
          {thirdTie && (
            <div className="w-[132px] rounded-md border border-border bg-card overflow-hidden">
              <div className="px-2 pt-1 text-center">
                <span className="text-[7px] font-black uppercase tracking-wide text-muted-foreground">3rd Place</span>
              </div>
              <div className="flex items-start gap-1 px-2 pb-1.5 pt-0.5">
                <Competitor team={thirdTie.homeTeam} slot={thirdTie.homeSlot} />
                <span className="text-[8px] font-bold text-muted-foreground/50 self-center">v</span>
                <Competitor team={thirdTie.awayTeam} slot={thirdTie.awaySlot} />
              </div>
            </div>
          )}
        </div>

        {/* Right half (mirrored) */}
        {rightRoot != null && <BracketNode tieId={rightRoot} mirror ctx={ctx} />}

      </div>
    </div>
  )
}
