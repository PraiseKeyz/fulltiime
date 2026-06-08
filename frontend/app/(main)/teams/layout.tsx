import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Teams',
  description:
    'Explore football teams — squads, fixtures, results, stats and standings for clubs around the world.',
  path: '/teams',
})

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return children
}
