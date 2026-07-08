import type { ArticleStatus } from '@/lib/api/domain'
import { cn } from '@/lib/utils'

const STATUS_STYLE: Record<ArticleStatus, { label: string; className: string }> = {
  DRAFT:      { label: 'Draft',     className: 'border-border text-txt2' },
  IN_REVIEW:  { label: 'In review', className: 'border-gold/60 text-gold' },
  PUBLISHED:  { label: 'Published', className: 'border-primary/60 text-primary' },
  ARCHIVED:   { label: 'Archived',  className: 'border-border text-muted-foreground line-through' },
}

export function StatusChip({ status }: { status: ArticleStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] uppercase',
        s.className,
      )}
    >
      {s.label}
    </span>
  )
}
