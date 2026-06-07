import Image from 'next/image'
import { LaunchCountdown } from './_components/launch-countdown'

export const metadata = {
  title: 'Coming Soon — Fulltiime',
}

export default function ComingSoonPage() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden md:h-screen md:flex-row md:overflow-visible">

      {/* Left — hero image */}
      <div className="relative w-full md:w-[55%] h-[38vh] md:h-screen shrink-0">
        <Image
          src="/fulltime.png"
          alt="Fulltiime — Coming Soon"
          fill
          priority
          className="object-cover object-top"
        />
        {/* Fade — bottom on mobile, right edge on desktop */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-92% to-[#0a0a0a] md:bg-gradient-to-r md:from-transparent md:from-0% md:via-transparent md:via-[80%] md:to-[#0a0a0a]" />
      </div>

      {/* Right — text panel */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[#0a0a0a] px-8 py-6 text-center md:text-left md:items-start md:px-16 md:py-14">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-3 md:mb-6">
          Something big is loading
        </p>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
          Coming<br />Soon
        </h1>

        <p className="mt-3 text-[14px] sm:text-[17px] text-[#888] leading-relaxed max-w-sm md:mt-5">
          with a <span className="text-primary font-semibold">fulltiime</span> football experience
        </p>

        {/* Countdown to launch */}
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.25em] text-[#666] mb-3 md:mt-10 md:mb-4">
          Launching June 9
        </p>
        <LaunchCountdown />

        {/* Decorative divider */}
        <div className="mt-6 h-px w-16 bg-primary/40 md:mt-10" />

        <p className="mt-4 text-[11px] text-[#555] tracking-wide md:mt-6 md:text-[12px]">
          © {new Date().getFullYear()} FULLTIIME. All rights reserved. A product of Glostarep Media Limited.
        </p>
      </div>

    </div>
  )
}
