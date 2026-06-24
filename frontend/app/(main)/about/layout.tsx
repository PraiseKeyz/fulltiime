import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'Fulltiime is football beyond the final whistle — live scores, fixtures, standings, news and AI-powered match analysis, from Glostarep Media Limited.',
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
