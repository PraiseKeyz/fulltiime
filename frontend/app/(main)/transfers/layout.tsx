import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Transfer News',
  description:
    'The latest football transfer news, confirmed deals, rumours and done deals from every transfer window.',
  path: '/transfers',
})

export default function TransfersLayout({ children }: { children: React.ReactNode }) {
  return children
}
