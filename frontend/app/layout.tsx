import type { Metadata } from 'next'
import { Anton, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import './globals.css'

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Fulltiime — Football News, Scores & Standings',
    template: '%s | Fulltiime',
  },
  description: 'Live football scores, fixtures, standings, news and more.',
  icons: {
    icon: [
      { url: '/dark-favicon.png', media: '(prefers-color-scheme: light)' },
      { url: '/light-favicon.png',  media: '(prefers-color-scheme: dark)'  },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
