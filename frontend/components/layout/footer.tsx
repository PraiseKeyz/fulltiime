import Link from 'next/link'
import { Twitter, Instagram, Youtube } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'News', href: '/news' },
      { label: 'Matches', href: '/matches' },
      { label: 'Live', href: '/live' },
      { label: 'Analytics', href: '/analytics' },
      { label: 'Videos', href: '/videos' },
    ],
  },
  {
    title: 'Competitions',
    links: [
      { label: 'Premier League', href: '/competitions/pl' },
      { label: 'Champions League', href: '/competitions/ucl' },
      { label: 'La Liga', href: '/competitions/laliga' },
      { label: 'Serie A', href: '/competitions/seriea' },
      { label: 'Bundesliga', href: '/competitions/bundesliga' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1.5 mb-3">
              <img src="/dark-favicon.png" alt="Fulltiime" className="h-7 w-7 rounded-md" />
              <span className="text-[15px] font-black tracking-wider">FULLTIIME</span>
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

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} FULLTIIME. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
