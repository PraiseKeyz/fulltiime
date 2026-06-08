import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Fixtures & Schedule',
  description:
    'Upcoming football fixtures and the full match schedule across every major league and competition.',
  path: '/fixtures',
})

export default function FixturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
