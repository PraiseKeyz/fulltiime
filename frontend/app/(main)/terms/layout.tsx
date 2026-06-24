import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions',
  description:
    'The terms that govern your use of Fulltiime and its services.',
  path: '/terms',
})

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
