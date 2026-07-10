import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Fulltiime" className="mb-8 h-7 w-auto" />

      <div className="relative mb-2 font-heading text-[clamp(96px,22vw,180px)] leading-none text-head">
        4<span className="text-primary">0</span>4
      </div>
      <span className="mb-5 font-mono text-[12px] tracking-[0.14em] text-muted-foreground">
        ◎ OFF TARGET
      </span>

      <h1 className="max-w-[480px] text-[clamp(24px,4vw,34px)] uppercase leading-[1.02]">
        This one went over the bar
      </h1>
      <p className="mx-auto mt-3 max-w-[400px] text-[15px] leading-relaxed text-txt2">
        The page you&apos;re after doesn&apos;t exist — it may have been moved, unpublished, or the
        link took a deflection.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-3 text-[14px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to the homepage
        </Link>
        <Link
          href="/news"
          className="rounded-full border border-border px-6 py-3 text-[14px] font-bold text-txt2 transition-colors hover:border-primary hover:text-primary"
        >
          Latest stories →
        </Link>
      </div>
    </div>
  )
}
