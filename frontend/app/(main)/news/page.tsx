'use client'

import { useState } from 'react'
import { Zap, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = 'ALL' | 'BREAKING' | 'TRANSFERS' | 'ANALYSIS' | 'PREMIER LEAGUE' | 'CHAMPIONS LEAGUE' | 'LA LIGA'

// ── Mock data ─────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  'CHAMPIONS LEAGUE': '#4da6ff',
  'PREMIER LEAGUE':   '#8b5cf6',
  'LA LIGA':          '#f97316',
  'TRANSFERS':        '#f59e0b',
  "WOMEN'S FOOTBALL": '#ec4899',
  'BUNDESLIGA':       '#ef4444',
  'TACTICAL ANALYSIS':'#22c55e',
  'ANALYTICS':        '#22c55e',
  'BREAKING':         '#ef4444',
}

const ARTICLES = [
  {
    id: '1',
    badge: 'TOP STORY',
    tag: 'CHAMPIONS LEAGUE',
    title: "Saka's Brace Fires Arsenal Into UCL Quarter-Finals",
    excerpt: 'Bukayo Saka scored twice in seven minutes to send the Gunners through in a breathless European night at the Emirates.',
    author: 'James Morrison',
    time: '12 min ago',
    readTime: '4 min',
    cover: '/placeholder-football.jpg',
    featured: true,
    categories: ['BREAKING', 'CHAMPIONS LEAGUE'],
  },
  {
    id: '2',
    badge: null,
    tag: 'TRANSFERS',
    title: 'Haaland Set For Shock Move to Real Madrid This Summer',
    excerpt: 'City will not stand in the striker\'s way if Madrid triggers his release clause, sources close to the club confirm.',
    author: 'Elena Torres',
    time: '38 min ago',
    readTime: '3 min',
    cover: '/placeholder-football.jpg',
    featured: false,
    categories: ['TRANSFERS'],
  },
  {
    id: '3',
    badge: null,
    tag: 'PREMIER LEAGUE',
    title: "Klopp's Final Season: How Liverpool Are Defying the Odds",
    excerpt: "Liverpool's remarkable title push under their outgoing manager has football asking whether they saved their best...",
    author: 'Tom Clarke',
    time: '1 hr ago',
    readTime: '6 min',
    cover: '',
    featured: false,
    categories: ['PREMIER LEAGUE', 'ANALYSIS'],
  },
  {
    id: '4',
    badge: null,
    tag: 'LA LIGA',
    title: "Vinicius Wins Ballon d'Or in Ceremony Dominated by Madrid",
    excerpt: 'The Brazilian winger claimed football\'s highest individual honour in Paris, with six Real Madrid players in the top ten.',
    author: 'Carlos Medina',
    time: '2 hr ago',
    readTime: '5 min',
    cover: '',
    featured: false,
    categories: ['LA LIGA'],
  },
  {
    id: '5',
    badge: null,
    tag: "WOMEN'S FOOTBALL",
    title: "Women's World Cup 2027 Host Announced: Brazil Wins Bid",
    excerpt: "FIFA confirmed Brazil as the host nation for the 2027 Women's World Cup, defeating South Africa's bid by 119...",
    author: 'Sarah Williams',
    time: '3 hr ago',
    readTime: '3 min',
    cover: '/placeholder-football.jpg',
    featured: false,
    categories: ['BREAKING'],
  },
  {
    id: '6',
    badge: null,
    tag: 'BUNDESLIGA',
    title: 'Bayern Munich Appoint Xabi Alonso As New Head Coach',
    excerpt: 'The Spanish tactician ends his spell at Bayer Leverkusen to take charge at the Allianz Arena on a three-year deal.',
    author: 'Hans Mueller',
    time: '4 hr ago',
    readTime: '4 min',
    cover: '/placeholder-stadium.jpg',
    featured: false,
    categories: ['BREAKING'],
  },
  {
    id: '7',
    badge: null,
    tag: 'TACTICAL ANALYSIS',
    title: "How Arteta's 4-3-3 Is Dominating European Opponents",
    excerpt: "A tactical deep-dive into Arsenal's pressing structure and how their high defensive line is redefining modern football...",
    author: 'David Mitchell',
    time: '5 hr ago',
    readTime: '9 min',
    cover: '',
    featured: false,
    categories: ['ANALYSIS'],
  },
  {
    id: '8',
    badge: null,
    tag: 'ANALYTICS',
    title: "xG Explained: Why Goals Don't Tell The Full Story",
    excerpt: "Expected Goals (xG) is reshaping how we understand football. We break down the metric and what it really tells u...",
    author: 'Priya Sharma',
    time: 'Yesterday',
    readTime: '7 min',
    cover: '/placeholder-football.jpg',
    featured: false,
    categories: ['ANALYSIS'],
  },
  {
    id: '9',
    badge: null,
    tag: 'LA LIGA',
    title: 'Bellingham at Real Madrid: The Stats Behind the Phenomenon',
    excerpt: 'One full season of Jude Bellingham at Madrid — and the numbers reveal a player operating at a level rarely seen fro...',
    author: 'Rafael Costa',
    time: '2 days ago',
    readTime: '8 min',
    cover: '',
    featured: false,
    categories: ['ANALYSIS', 'LA LIGA'],
  },
]

const FILTER_TABS: Category[] = ['ALL', 'BREAKING', 'TRANSFERS', 'ANALYSIS', 'PREMIER LEAGUE', 'CHAMPIONS LEAGUE', 'LA LIGA']

// ── Article image placeholder ─────────────────────────────────────────────────

function ArticleImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('bg-muted overflow-hidden relative', className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Zap className="h-8 w-8 text-muted-foreground/20" />
        </div>
      )}
    </div>
  )
}

// ── Featured top story ────────────────────────────────────────────────────────

function FeaturedStory({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <Link
      href={`/news/${article.id}`}
      className="group grid md:grid-cols-2 rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <ArticleImage src={article.cover} alt={article.title} className="h-64 md:h-full" />

      <div className="p-6 flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-live text-white text-[10px] font-black px-2.5 py-1 rounded">
            TOP STORY
          </span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: TAG_COLORS[article.tag] }}>
          {article.tag}
        </span>
        <h2 className="text-2xl font-black leading-snug group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground pt-1">
          <span className="font-semibold text-foreground">{article.author}</span>
          <span>·</span>
          <span>{article.time}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  )
}

// ── Regular article card ──────────────────────────────────────────────────────

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <Link
      href={`/news/${article.id}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <ArticleImage src={article.cover} alt={article.title} className="h-44 w-full" />

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TAG_COLORS[article.tag] ?? '#888' }}>
          {article.tag}
        </span>
        <h3 className="text-[14px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border mt-1">
          <span>{article.time}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [active, setActive] = useState<Category>('ALL')

  const filtered = active === 'ALL'
    ? ARTICLES
    : ARTICLES.filter((a) => a.categories.includes(active) || a.tag === active)

  const [featured, ...rest] = filtered

  return (
    <>
      {/* Page header — dark */}
      <div className="bg-[#111111] dark:bg-[#111111] py-8 border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <h1 className="flex items-center gap-2 text-3xl font-black text-white">
            <Zap className="h-7 w-7 text-primary fill-primary" />
            News
          </h1>
          <p className="text-[13px] text-[#888] mt-1">The latest from across world football</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-background-secondary border-b border-border sticky top-14 z-40">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-[12px] font-bold transition-colors',
                  active === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8 space-y-6">
        {/* Featured */}
        {featured && <FeaturedStory article={featured} />}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No articles found in this category.
          </div>
        )}
      </div>
    </>
  )
}
