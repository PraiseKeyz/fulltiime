import Link from 'next/link'
import { Cover } from '@/components/content/cover'
import type { Story } from '@/lib/story'

/** Card used on the /news listing and article "you might also like" rail. */
export function StoryCard({ story }: { story: Story }) {
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
        <h3 className="m-0 line-clamp-3 text-balance font-inter text-[19px] font-bold leading-[1.2] tracking-[-0.01em]">
          {story.headline}
        </h3>
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
