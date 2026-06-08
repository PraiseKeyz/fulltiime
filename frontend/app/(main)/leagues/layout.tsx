import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Leagues & Competitions',
  description:
    'Browse football leagues and competitions — tables, fixtures, results and knockout brackets for every major competition.',
  path: '/leagues',
})

export default function LeaguesLayout({ children }: { children: React.ReactNode }) {
  return children
}
