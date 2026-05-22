'use client'

import { useParams } from 'next/navigation'
import { Zap, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const TAG_COLORS: Record<string, string> = {
  'CHAMPIONS LEAGUE': '#4da6ff',
  'PREMIER LEAGUE':   '#8b5cf6',
  'LA LIGA':          '#f97316',
  'TRANSFERS':        '#f59e0b',
  "WOMEN'S FOOTBALL": '#ec4899',
  'BUNDESLIGA':       '#ef4444',
  'TACTICAL ANALYSIS':'#22c55e',
  'ANALYTICS':        '#22c55e',
}

// Placeholder — will be replaced with real API data
const MOCK_ARTICLE = {
  tag: 'CHAMPIONS LEAGUE',
  title: "Saka's Brace Fires Arsenal Into UCL Quarter-Finals",
  excerpt: 'Bukayo Saka scored twice in seven minutes to send the Gunners through in a breathless European night at the Emirates.',
  content: `Bukayo Saka delivered a masterclass performance as Arsenal secured their place in the UEFA Champions League quarter-finals with a stunning display at the Emirates Stadium.

The England international, who has been in scintillating form all season, opened the scoring with a precise finish from outside the box before doubling the lead with a brilliant solo effort that left the Barcelona goalkeeper rooted to the spot.

Arsenal's defensive resilience was equally impressive, with the backline marshalled superbly by William Saliba keeping the Catalan giants at bay throughout a breathless second half.

Manager Mikel Arteta praised his side's composure and tactical discipline after the final whistle, describing it as "one of the great European nights in the club's recent history."`,
  author: 'James Morrison',
  authorAvatar: '',
  time: '12 min ago',
  readTime: '4 min',
  cover: '',
  tags: ['Arsenal', 'Champions League', 'Saka'],
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()

  const article = MOCK_ARTICLE

  return (
    <>
      {/* Dark header */}
      <div className="bg-[#111111] dark:bg-[#111111] border-b border-border py-6">
        <div className="mx-auto max-w-[900px] px-4 lg:px-6">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to News
          </Link>

          <span className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: TAG_COLORS[article.tag] ?? '#888' }}>
            {article.tag}
          </span>

          <h1 className="text-3xl font-black text-white leading-tight">{article.title}</h1>

          {article.excerpt && (
            <p className="mt-3 text-[15px] text-[#aaa] leading-relaxed">{article.excerpt}</p>
          )}

          <div className="flex items-center gap-2 mt-4 text-[12px] text-[#666]">
            <span className="text-[#aaa] font-semibold">{article.author}</span>
            <span>·</span>
            <span>{article.time}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[900px] px-4 lg:px-6 py-8">
        {/* Cover image */}
        {article.cover ? (
          <img src={article.cover} alt={article.title} className="w-full rounded-xl object-cover max-h-[440px] mb-8" />
        ) : (
          <div className="w-full rounded-xl bg-muted h-64 flex items-center justify-center mb-8">
            <Zap className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}

        {/* Body text */}
        <div className="prose max-w-none space-y-4">
          {article.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
              {para}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
