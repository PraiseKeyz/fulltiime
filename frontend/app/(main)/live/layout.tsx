import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Live Football Scores',
  description:
    'Follow live football scores in real time — goals, line-ups and match stats as they happen across every major league.',
  path: '/live',
})

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children
}
