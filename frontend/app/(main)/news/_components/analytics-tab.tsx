'use client'

import { BarChart2, Activity, Target, Gauge, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface XGLeader { rank: number; name: string; team: string; xg: number; goals: number }
interface PowerRanking { rank: number; team: string; score: number; delta: number }
interface AnalysisArticle { id: string; tag: string; tagColor: string; title: string; excerpt: string; author: string; readTime: string }

const STAT_CARDS = [
  { icon: Target,    value: '2.74',  label: 'AVG GOALS / MATCH', delta: '+0.12', positive: true  },
  { icon: Activity,  value: '2.51',  label: 'AVG XG / MATCH',    delta: '+0.08', positive: true  },
  { icon: BarChart2, value: '11.2%', label: 'CONVERSION RATE',   delta: '-0.3%', positive: false },
  { icon: Gauge,     value: '84.6%', label: 'PASS ACCURACY',     delta: '+0.4%', positive: true  },
]

const MAX_XG = 26

const XG_LEADERS: XGLeader[] = [
  { rank: 1, name: 'Erling Haaland', team: 'Man City',      xg: 21.4, goals: 24 },
  { rank: 2, name: 'Mohamed Salah',  team: 'Liverpool',     xg: 19.8, goals: 22 },
  { rank: 3, name: 'Harry Kane',     team: 'Bayern Munich', xg: 18.2, goals: 20 },
  { rank: 4, name: 'Bukayo Saka',    team: 'Arsenal',       xg: 14.6, goals: 17 },
  { rank: 5, name: 'Kylian Mbappé',  team: 'Real Madrid',   xg: 17.1, goals: 19 },
]

const POWER_RANKINGS: PowerRanking[] = [
  { rank: 1, team: 'Manchester City', score: 89.4, delta:  0.3 },
  { rank: 2, team: 'Real Madrid',     score: 88.7, delta: -0.1 },
  { rank: 3, team: 'Arsenal',         score: 87.2, delta:  0.8 },
  { rank: 4, team: 'Bayern Munich',   score: 86.9, delta:  0.2 },
  { rank: 5, team: 'Liverpool',       score: 86.5, delta:  0.5 },
  { rank: 6, team: 'Barcelona',       score: 85.8, delta: -0.4 },
]

const DEEP_DIVES: AnalysisArticle[] = [
  { id: '1', tag: 'TACTICAL ANALYSIS', tagColor: '#22c55e', title: "How Arteta's 4-3-3 Is Dominating European Opponents", excerpt: "A tactical deep-dive into Arsenal's pressing structure and how their high defensive line is redefining modern football...", author: 'David Mitchell', readTime: '9 min' },
  { id: '2', tag: 'ANALYTICS',         tagColor: '#22c55e', title: "xG Explained: Why Goals Don't Tell The Full Story", excerpt: 'Expected Goals (xG) is reshaping how we understand football. We break down the metric and what it really tells...', author: 'Priya Sharma', readTime: '7 min' },
  { id: '3', tag: 'LA LIGA',           tagColor: '#f97316', title: 'Bellingham at Real Madrid: The Stats Behind the Phenomenon', excerpt: 'One full season of Jude Bellingham at Madrid — and the numbers reveal a player operating at a level rarely seen...', author: 'Rafael Costa', readTime: '8 min' },
]

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ icon: Icon, value, label, delta, positive }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between mb-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className={`text-[12px] font-bold ${positive ? 'text-green-500' : 'text-red-500'}`}>{delta}</span>
            </div>
            <div className="text-[32px] font-black leading-none mb-1.5">{value}</div>
            <div className="text-[10px] font-bold text-muted-foreground tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* xG Leaders + Power Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[13px] font-black uppercase tracking-widest">xG Leaders</h2>
            <span className="text-[11px] text-muted-foreground">2024/25</span>
          </div>
          <div className="space-y-5">
            {XG_LEADERS.map(player => {
              const xgPct = (player.xg / MAX_XG) * 100
              const goalsPct = (player.goals / MAX_XG) * 100
              return (
                <div key={player.rank}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] text-muted-foreground shrink-0">{player.rank}</span>
                      <span className="text-[13px] font-bold truncate">{player.name}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{player.team}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2 text-[12px]">
                      <span className="text-muted-foreground">xG <span className="font-bold text-foreground">{player.xg}</span></span>
                      <span className="font-black text-primary">{player.goals}G</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-muted-foreground/40" style={{ width: `${xgPct}%` }} />
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${goalsPct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-2 w-3 rounded-sm bg-muted-foreground/40" /> xG (Expected)</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-2 w-3 rounded-sm bg-primary" /> Goals (Actual)</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[13px] font-black uppercase tracking-widest">Power Rankings</h2>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" /> LIVE
            </span>
          </div>
          <div className="divide-y divide-border">
            {POWER_RANKINGS.map(team => (
              <div key={team.rank} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground w-4 shrink-0">{team.rank}</span>
                  <span className="text-[14px] font-semibold">{team.team}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[20px] font-black tabular-nums">{team.score}</span>
                  <span className={`text-[12px] font-bold w-10 text-right tabular-nums ${team.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {team.delta >= 0 ? '+' : ''}{team.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deep Dives */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-black uppercase tracking-wide">Deep Dives</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEEP_DIVES.map(article => (
            <Link key={article.id} href={`/news/${article.id}`} className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors">
              <div className="h-48 bg-muted flex items-center justify-center">
                <BarChart2 className="h-10 w-10 text-muted-foreground/20" />
              </div>
              <div className="p-5">
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: article.tagColor }}>{article.tag}</span>
                <h3 className="text-[15px] font-black leading-snug mt-1.5 mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
                  <span className="font-semibold">{article.author}</span><span>·</span><span>{article.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
