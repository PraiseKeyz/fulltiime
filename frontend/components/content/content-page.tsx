import type { ReactNode } from 'react'

// Shared shell for static content pages (About, Privacy, Terms). Keeps the
// container width, heading, and body typography identical across all of them —
// pages just supply semantic <section>/<h2>/<p>/<ul> and the styling is applied
// here via descendant selectors, so the page bodies stay copy-only.
export function ContentPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string
  updated?: string
  intro?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-6 py-12">
      <h1 className="text-3xl font-black tracking-tight text-foreground">{title}</h1>
      {updated && <p className="mt-2 text-[13px] text-muted-foreground">Last updated: {updated}</p>}
      {intro && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{intro}</p>}

      <div
        className={
          'mt-8 space-y-8 text-[15px] leading-relaxed text-muted-foreground ' +
          '[&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground ' +
          '[&_p]:mt-2 [&_a]:text-primary [&_a]:underline ' +
          '[&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5'
        }
      >
        {children}
      </div>
    </div>
  )
}
