import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  href?: string
  className?: string
}

export function SectionHeader({ title, href, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <h2 className="text-base font-bold uppercase tracking-wider text-foreground">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-medium text-primary hover:underline">
          See all
        </Link>
      )}
    </div>
  )
}
