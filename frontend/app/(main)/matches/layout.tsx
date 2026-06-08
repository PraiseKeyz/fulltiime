import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Matches & Results',
  description:
    'Browse football matches and results with live scores, line-ups, match stats and head-to-head data.',
  path: '/matches',
})

export default function MatchesLayout({ children }: { children: React.ReactNode }) {
  return children
}
