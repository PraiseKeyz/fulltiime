import { Target, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'

const FEATURED = {
  id: '1',
  tag: 'Tactical Analysis',
  title: "How Arteta's 4-3-3 Is Dominating European Opponents",
  excerpt: "A tactical deep-dive into Arsenal's pressing structure and how their high defensive line is redefining modern football strategy.",
  author: 'David Mitchell',
  readTime: '9 min read',
  cover: '',
}

const SIDE_ARTICLES = [
  {
    id: '2',
    tag: 'Analytics',
    title: "xG Explained: Why Goals Don't Tell The Full Story",
    author: 'Priya Sharma',
    readTime: '7 min read',
    cover: '',
  },
  {
    id: '3',
    tag: 'La Liga',
    title: 'Bellingham at Real Madrid: The Stats Behind the Phenomenon',
    author: 'Rafael Costa',
    readTime: '8 min read',
    cover: '',
  },
]

export function FeaturedAnalysis() {
  return (
    <section className="py-8 bg-background-secondary">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <Target className="h-5 w-5 text-primary" />
            Featured Analysis
          </h2>
          <Link href="/analytics" className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline">
            All Analysis <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="text-[12px] text-muted-foreground mb-5">Tactical depth. Data-driven insight.</p>

        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          {/* Featured large card */}
          <Link
            href={`/analytics/${FEATURED.id}`}
            className="group relative rounded-xl overflow-hidden border border-border min-h-[280px] flex flex-col justify-end bg-card hover:border-primary/40 transition-colors"
          >
            {/* Dark overlay bg */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            <div className="absolute inset-0 bg-muted/30" />

            <div className="relative p-5 space-y-2">
              <div className="flex gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground">ANALYSIS</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white">TACTICAL ANALYSIS</span>
              </div>
              <h3 className="text-xl font-black text-white leading-snug group-hover:text-primary transition-colors">
                {FEATURED.title}
              </h3>
              <p className="text-[12px] text-white/70 leading-relaxed line-clamp-2">
                {FEATURED.excerpt}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-white/50 pt-1">
                <span>{FEATURED.author}</span>
                <span>·</span>
                <Clock className="h-3 w-3" />
                <span>{FEATURED.readTime}</span>
                <span className="ml-auto text-primary font-semibold">Read →</span>
              </div>
            </div>
          </Link>

          {/* Side articles */}
          <div className="flex flex-col gap-3">
            {SIDE_ARTICLES.map((article) => (
              <Link
                key={article.id}
                href={`/analytics/${article.id}`}
                className="group flex gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
              >
                <div className="h-16 w-16 rounded-lg bg-muted shrink-0 overflow-hidden">
                  {article.cover && <img src={article.cover} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{article.tag}</span>
                  <h4 className="text-[13px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 mt-0.5">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {article.author} · {article.readTime}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
