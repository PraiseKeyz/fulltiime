import { EditorialHome } from '@/components/home/editorial-home'
import { getHome } from '@/lib/api/server'

export const revalidate = 60

export default async function HomePage() {
  const home = await getHome()

  // Reached only when the API is unreachable — with a live newsroom there is
  // always content, so this is a server-trouble state, not an empty state.
  if (!home || !home.featured) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[var(--content-max)] flex-col items-center justify-center px-4.5 py-24 text-center sm:px-10">
        <span className="mb-4 font-mono text-[12px] tracking-[0.14em] text-live">
          ● TEMPORARY STOPPAGE
        </span>
        <h1 className="max-w-[560px] text-[clamp(30px,5.5vw,48px)] uppercase leading-[0.98]">
          We&apos;re having trouble reaching the newsroom
        </h1>
        <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-relaxed text-txt2">
          Our servers are being difficult — the stories are safe, they just can&apos;t get through
          right now. Give it a minute and refresh.
        </p>
        <p className="mt-6 font-mono text-[12px] text-muted-foreground">
          this page retries automatically · no action needed
        </p>
      </div>
    )
  }

  return <EditorialHome home={home} />
}
