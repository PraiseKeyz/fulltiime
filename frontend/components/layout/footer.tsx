import Link from 'next/link'
import { Twitter, Instagram, Youtube } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'News', href: '/news' },
      { label: 'Matches', href: '/matches' },
      { label: 'Fixtures', href: '/fixtures' },
      { label: 'Live', href: '/live' },
    ],
  },
  {
    title: 'Competitions',
    links: [
      { label: 'All Leagues', href: '/leagues' },
      { label: 'Standings', href: '/standings' },
      { label: 'Teams', href: '/teams' },
      { label: 'Transfers', href: '/news?category=TRANSFER' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-3">
              <img src="/logo.svg" alt="Fulltiime" className="h-6 w-auto" />
            </Link>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[200px]">
              Football organized intelligently. The home of intelligent football coverage.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="YouTube" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-sans uppercase tracking-widest mb-3 text-foreground">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} FULLTIIME. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
