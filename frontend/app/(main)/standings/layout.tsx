import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'League Standings & Tables',
  description:
    "Up-to-date league standings and tables for the world's top football competitions — form, goal difference and points.",
  path: '/standings',
})

export default function StandingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
