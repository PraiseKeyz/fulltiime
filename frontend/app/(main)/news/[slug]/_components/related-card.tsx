import Link from 'next/link'
import { Newspaper } from 'lucide-react'
import { CATEGORY_COLOR } from './category-colors'

export function RelatedCard({ slug, title, cover_url, category }: { slug: string; title: string; cover_url: string | null; category: string }) {
  return (
    <Link
      href={`/news/${slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <div className="h-32 bg-muted overflow-hidden">
        {cover_url ? (
          <img src={cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="h-7 w-7 text-muted-foreground/20" />
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: CATEGORY_COLOR[category] ?? '#888' }}>
          {category.replace('_', ' ')}
        </span>
        <h4 className="text-[13px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h4>
      </div>
    </Link>
  )
}
