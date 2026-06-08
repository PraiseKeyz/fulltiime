import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Football News',
  description:
    'The latest football news, breaking stories, transfer rumours and in-depth analysis from across the world of football.',
  path: '/news',
})

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
