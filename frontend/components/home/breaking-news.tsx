import { Zap, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const BADGE_COLORS: Record<string, string> = {
  BREAKING: 'bg-live text-white',
  TRANSFER: 'bg-amber-500 text-black',
  FEATURE: 'bg-blue-500 text-white',
  EXCLUSIVE: 'bg-purple-600 text-white',
}

const MOCK_ARTICLES = [
  {
    id: '1',
    badge: 'BREAKING',
    tag: 'Champions League',
    tagColor: '#4da6ff',
    title: "Saka's Brace Fires Arsenal Into UCL Quarter-Finals",
    author: 'James Morrison',
    time: '12 min ago',
    readTime: '4 min',
    cover: '',
    featured: true,
  },
  {
    id: '2',
    badge: 'TRANSFER',
    tag: 'Transfers',
    tagColor: '#f59e0b',
    title: 'Haaland Set For Shock Move to Real Madrid This Summer',
    author: 'Elena Torres',
    time: '38 min ago',
    readTime: '3 min',
    cover: '',
    featured: false,
  },
  {
    id: '3',
    badge: 'FEATURE',
    tag: 'Premier League',
    tagColor: '#4da6ff',
    title: "Klopp's Final Season: How Liverpool Are Defying the Odds",
    author: 'Tom Clarke',
    time: '1 hr ago',
    readTime: '6 min',
    cover: '',
    featured: false,
  },
  {
    id: '4',
    badge: 'BREAKING',
    tag: 'La Liga',
    tagColor: '#f59e0b',
    title: "Vinicius Wins Ballon d'Or in Ceremony Dominated by Madrid",
    author: 'Carlos Medina',
    time: '3 hr ago',
    readTime: '5 min',
    cover: '',
    featured: false,
  },
  {
    id: '5',
    badge: 'BREAKING',
    tag: "Women's Football",
    tagColor: '#22c55e',
    title: "Women's World Cup 2027 Host Announced: Brazil Wins Bid",
    author: 'Sarah Williams',
    time: '3 hr ago',
    readTime: '3 min',
    cover: '',
    featured: false,
  },
  {
    id: '6',
    badge: 'BREAKING',
    tag: 'Bundesliga',
    tagColor: '#ef4444',
    title: 'Bayern Munich Appoint Xabi Alonso As New Head Coach',
    author: 'Hans Mueller',
    time: '4 hr ago',
    readTime: '4 min',
    cover: '',
    featured: false,
  },
]

function ArticleCard({ article, large = false }: { article: typeof MOCK_ARTICLES[0]; large?: boolean }) {
  return (
    <Link href={`/news/${article.id}`} className="group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors">
      {/* Cover */}
      <div className={cn('w-full bg-muted relative overflow-hidden', large ? 'h-52' : 'h-40')}>
        {article.cover ? (
          <img src={article.cover} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Zap className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        {/* Badge overlay */}
        {article.badge && (
          <span className={cn('absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded', BADGE_COLORS[article.badge] ?? 'bg-muted text-foreground')}>
            {article.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: article.tagColor }}>
          {article.tag}
        </span>
        <h3 className={cn('font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2', large ? 'text-[15px]' : 'text-[13px]')}>
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{article.author}</span>
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

export function BreakingNews() {
  const [featured, ...rest] = MOCK_ARTICLES

  return (
    <section className="py-8">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <Zap className="h-5 w-5 text-primary fill-primary" />
            Breaking News
          </h2>
          <Link href="/news" className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            All News <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ArticleCard article={featured} large />
          {rest.slice(0, 2).map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {rest.slice(2, 5).map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </div>
    </section>
  )
}
