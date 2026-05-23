import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Image from 'next/image'

// ── Coming Soon gate ──────────────────────────────────────────────────────────
// Flip to false when ready to launch — applies to every page on the site
const COMING_SOON = true

export default function MainLayout({ children }: { children: React.ReactNode }) {
  if (COMING_SOON) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">

        {/* Left — hero image */}
        <div className="relative w-full md:w-[55%] h-[55vh] md:h-screen shrink-0">
          <Image
            src="/fulltime.png"
            alt="Fulltiime — Coming Soon"
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        {/* Right — text panel */}
        <div className="flex flex-1 flex-col items-center justify-center bg-[#0a0a0a] px-8 py-14 text-center md:text-left md:items-start md:px-16">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-6">
            Something big is loading
          </p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Coming<br />Soon
          </h1>

          <p className="mt-5 text-[15px] sm:text-[17px] text-[#888] leading-relaxed max-w-sm">
            with a <span className="text-primary font-semibold">fulltiime</span> football experience
          </p>

          {/* Decorative divider */}
          <div className="mt-10 h-px w-16 bg-primary/40" />

          <p className="mt-6 text-[12px] text-[#555] tracking-wide">
            © 2026 FULLTIIME. All rights reserved.
          </p>
        </div>

      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
