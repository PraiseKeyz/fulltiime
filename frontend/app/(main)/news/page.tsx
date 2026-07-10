import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Cover } from '@/components/content/cover'
import { getArticles } from '@/lib/api/server'
import { toStory, type Story } from '@/lib/story'
import { ALL_SECTIONS, CATEGORY_TO_SECTION, SECTION_META } from '@/lib/sections'

export const revalidate = 60

// ─── Category card (design "Category" screen) ─────────────────────────────────

function CategoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/news/${story.slug}`}
      className="flex flex-col overflow-hidden border border-border bg-background-secondary transition-colors hover:border-primary/40"
    >
      <div className="relative h-[170px]">
        <Cover src={story.src} seed={story.headline} hue={story.hue} className="absolute inset-0" />
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const section = category ? CATEGORY_TO_SECTION[category] : undefined
  const payload = await getArticles(section)
  const stories = (payload?.articles ?? []).map(toStory)
  const title = section ? SECTION_META[section].title : 'All Stories'

  return (
    <div data-bp className="mx-auto max-w-[var(--content-max)] px-4.5 pb-17.5 sm:px-10">
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
        <h1 className="m-0 text-[clamp(30px,6vw,52px)] uppercase leading-[0.95]">{title}</h1>
      </div>

      {/* Section filters */}
      <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1" data-scroll>
        <Link
          href="/news"
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors',
            !section
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-txt2 hover:border-primary hover:text-primary',
          )}
        >
          All
        </Link>
        {ALL_SECTIONS.map((s) => (
          <Link
            key={s}
            href={`/news?category=${SECTION_META[s].slug}`}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors',
              section === s
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-txt2 hover:border-primary hover:text-primary',
            )}
          >
            {SECTION_META[s].label}
          </Link>
        ))}
      </div>

      {stories.length === 0 ? (
        <div className="border border-dashed border-border py-20 text-center font-mono text-[13px] text-muted-foreground">
          Nothing here yet — new stories are on the way.
        </div>
      ) : (
        <div className="grid gap-5.5 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <CategoryCard key={story.slug} story={story} />
          ))}
        </div>
      )}
    </div>
  )
}
