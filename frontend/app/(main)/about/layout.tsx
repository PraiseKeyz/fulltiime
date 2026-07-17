import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'Fulltiime is independent football storytelling — deep reads, sharp tactics, live match threads and AI-assisted insight, from Glostarep Media Limited.',
  path: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
