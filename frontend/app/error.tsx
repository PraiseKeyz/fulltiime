'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface in the console for debugging; digest links it to server logs.
    console.error('App error boundary:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Fulltiime" className="mb-8 h-7 w-auto" />

      <span className="mb-4 font-mono text-[12px] tracking-[0.14em] text-live">
        ● VAR CHECK IN PROGRESS
      </span>
      <h1 className="max-w-[520px] text-[clamp(26px,4.5vw,40px)] uppercase leading-[1.02]">
        Something broke in the build-up
      </h1>
      <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-relaxed text-txt2">
        An unexpected error stopped play. It&apos;s on our side, not yours — a retry usually sorts
        it.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">ref: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-primary px-6 py-3 text-[14px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-6 py-3 text-[14px] font-bold text-txt2 transition-colors hover:border-primary hover:text-primary"
        >
          Back to the homepage
        </Link>
      </div>
    </div>
  )
}
