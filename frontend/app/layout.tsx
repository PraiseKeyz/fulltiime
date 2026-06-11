import type { Metadata } from 'next'
import { Anton, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { TimeZoneProvider } from '@/providers/timezone-provider'
import { Analytics } from '@/components/analytics/analytics'
import { ConsentBanner } from '@/components/analytics/consent-banner'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, TWITTER_HANDLE } from '@/lib/seo'
import './globals.css'

// const anton = Anton({
//   subsets: ['latin'],
//   weight: '400',
//   variable: '--font-anton',
// })

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Football News, Live Scores, Fixtures & Standings`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'football', 'soccer', 'live scores', 'fixtures', 'results',
    'league standings', 'football news', 'match stats', 'transfers', SITE_NAME,
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Football News, Live Scores, Fixtures & Standings`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `${SITE_NAME} — Football News, Live Scores, Fixtures & Standings`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/dark-favicon.png', media: '(prefers-color-scheme: light)' },
      { url: '/light-favicon.png',  media: '(prefers-color-scheme: dark)'  },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <TimeZoneProvider>
                {children}
                <Toaster position="top-right" richColors closeButton />
                <ConsentBanner />
              </TimeZoneProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
