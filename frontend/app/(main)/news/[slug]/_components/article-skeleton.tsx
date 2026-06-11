export function ArticleSkeleton() {
  return (
    <>
      <div className="bg-card border-b border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6 space-y-3">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-40 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8 space-y-4">
        <div className="w-full rounded-xl bg-muted h-64 animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${75 + Math.random() * 25}%` }} />
        ))}
      </div>
    </>
  )
}
