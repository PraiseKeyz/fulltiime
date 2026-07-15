'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Instagram, Youtube } from 'lucide-react'
import { useImmersive } from '@/providers/immersive-provider'

// Brand glyphs lucide no longer ships as first-class icons (X, TikTok, WhatsApp).
// Inline SVGs using currentColor so they inherit the same hover colour as the rest.
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

const SOCIALS = [
  { label: 'X',         href: 'https://x.com/FulltiimeSport',                                       Icon: XIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/fulltiimesport?igsh=czh5MDhyY3B0am0z',     Icon: Instagram },
  { label: 'YouTube',   href: 'https://youtube.com/@fulltiimesport?si=-KEhv7IEX706-vb5',            Icon: Youtube },
  { label: 'TikTok',    href: 'https://www.tiktok.com/@fulltiimesport?_r=1&_t=ZS-96vNU5lViGj',      Icon: TikTokIcon },
  { label: 'WhatsApp',  href: 'https://whatsapp.com/channel/0029Vb8Yk0JCHDyuhv7VCc44',              Icon: WhatsAppIcon },
]

const EXPLORE = [
  { label: 'News',               href: '/news' },
  { label: 'Transfers',          href: '/news?category=transfers' },
  { label: 'Fulltiime TV',       href: '/news?category=tv' },
  { label: 'Beyond the Whistle', href: '/news?category=beyond' },

]

const COMPANY = [
  { label: 'About',         href: '/about' },
  { label: 'Terms of Use',   href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
]

function CrossMark() {
  return (
    <svg width={8} height={8} shapeRendering="crispEdges" className="overflow-visible">
      <path
        d="M0 4H8M4 0V8"
        stroke="color-mix(in srgb, var(--foreground) 34%, transparent)"
        strokeWidth={1}
      />
    </svg>
  )
}

function ColumnMarks() {
  return (
    <>
      <span className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
        <CrossMark />
      </span>
      <span className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 lg:block">
        <CrossMark />
      </span>
    </>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div className="relative py-8 lg:border-l lg:border-border lg:px-10 lg:py-10">
      <ColumnMarks />
      <div className="mb-4.5 font-mono text-[12px] tracking-[0.12em] text-muted-foreground">{title}</div>
      <div className="flex flex-col gap-3 text-[14px] font-semibold text-txt2">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="transition-colors hover:text-primary">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function Footer() {
  const { immersive } = useImmersive()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  if (immersive) return null

  return (
    <footer className="mt-5">
      <div className="mx-auto max-w-[var(--content-max)] px-4.5 pt-8 pb-10 sm:px-10 sm:pt-13">
        <div className="grid grid-cols-1 border-t border-b border-border sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.15fr]">
          {/* About + newsletter */}
          <div className="py-8 sm:col-span-2 lg:col-span-1 lg:py-10 lg:pr-12">
            <Link href="/" aria-label="Fulltiime home" className="mb-3.5 inline-block">
              <img src="/logo.svg" alt="Fulltiime" className="h-7 w-auto" />
            </Link>
            <p className="mb-5.5 text-[14px] leading-relaxed text-txt2">
              Independent football storytelling deep reads, sharp tactics, and the culture around
              the game. Football beyond the final whistle.
            </p>
            <div className="mb-2.5 font-mono text-[12px] tracking-[0.12em] text-muted-foreground">
              NEVER MISS A MOMENT
            </div>
            {sent ? (
              <div className="py-2.5 text-[14px] font-semibold text-primary">
                ✓ You&apos;re in. Welcome to the conversation.
              </div>
            ) : (
              <form
                className="flex max-w-[360px] gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email.includes('@')) setSent(true)
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="min-w-0 flex-1 rounded-full border border-border bg-background-secondary px-4 py-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 text-[14px] font-bold text-primary-foreground"
                >
                  Subscribe
                </button>
              </form>
            )}
            <div className="mt-5.5 flex flex-wrap gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="EXPLORE" links={EXPLORE} />
          <FooterColumn
            title="LEAGUES"
            links={[
              { label: 'Premier League',   href: '/news?category=premier' },
              { label: 'Champions League', href: '/news?category=champions' },
              { label: 'World Cup 2026',   href: '/news?category=worldcup' },
              { label: 'The Motherland',     href: '/news?category=motherland' },
            ]}
          />
          <FooterColumn title="COMPANY" links={COMPANY} />
        </div>

        <div className="border-b border-border py-7">
          <p className="m-0 max-w-[940px] text-[15px] leading-[1.7] text-txt2">
            Fulltiime is built for the fan who reads deeply covering the leagues, the World Cup,
            and the human stories the scoreboard never tells. From NPFL matchdays to Champions
            League nights, every piece is written by people who actually watch the game, for people
            who never stop talking about it.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4.5 pt-6">
          <span className="font-mono text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} Fulltiime Media · Football beyond the final whistle · A
            product of Glostarep Media Limited
          </span>
          <div className="flex flex-wrap gap-5 font-mono text-[13px]">
            <a href="mailto:partnerships@fulltiime.com" className="text-primary hover:underline">
              fulltiime@glostarep.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
