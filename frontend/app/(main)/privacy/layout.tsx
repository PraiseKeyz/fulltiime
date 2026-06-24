import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'How Fulltiime collects, uses, and protects your personal information.',
  path: '/privacy',
})

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
