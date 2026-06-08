import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Analytics',
  description:
    'Football analytics and data insights — advanced match stats, trends and performance metrics.',
  path: '/analytics',
})

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children
}
