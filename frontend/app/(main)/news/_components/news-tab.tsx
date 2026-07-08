'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Cover } from '@/components/content/cover'
import { getSection, SECTIONS, SECTION_KEYS, type SectionKey, type Story } from '@/lib/dummy-content'

// ─── Category card (design "Category" screen) ─────────────────────────────────

function CategoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="flex flex-col overflow-hidden border border-border bg-background-secondary transition-colors hover:border-primary/40"
    >
      <div className="relative h-[170px]">
        <Cover seed={story.headline} hue={story.hue} className="absolute inset-0" />
        <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-primary px-2 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-primary-foreground">
          {story.kicker}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4.5">
        <h3 className="m-0 line-clamp-3 text-balance text-[23px] leading-[1.02]">{story.headline}</h3>
        {story.sub ? (
          <p className="m-0 line-clamp-3 text-[13px] leading-normal text-txt2">{story.sub}</p>
        ) : (
          <div className="font-mono text-[12px] text-muted-foreground">
            {story.author} · {story.read} read
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function NewsTab() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Derived from the URL so navbar/footer category links work while already
  // on /news — there is no remount when only the query string changes.
  const section = getSection(searchParams.get('category')) ?? SECTIONS.news
  const activeKey = (searchParams.get('category') ?? 'news') as SectionKey

  const handleCategory = (key: SectionKey) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'news') params.delete('category')
    else params.set('category', key)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <>
      <Link
        href="/"
        className="flex items-center gap-2 pt-6 pb-1 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← back to the homepage
      </Link>

      <div className="mt-2.5 border-t border-border pt-7.5 pb-7.5">
        <span className="mb-2 block font-mono text-[12px] tracking-[0.14em] text-primary">
          ◎ CATEGORY
        </span>
        <h1 className="m-0 text-[clamp(30px,6vw,52px)] uppercase leading-[0.95]">{section.title}</h1>
      </div>

      {/* Section filters */}
      <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1" data-scroll>
        {SECTION_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => handleCategory(key)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors',
              (getSection(activeKey) ? activeKey : 'news') === key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-txt2 hover:border-primary hover:text-primary',
            )}
          >
            {SECTIONS[key].label}
          </button>
        ))}
      </div>

      <div className="grid gap-5.5 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((story) => (
          <CategoryCard key={story.slug} story={story} />
        ))}
      </div>
    </>
  )
}
