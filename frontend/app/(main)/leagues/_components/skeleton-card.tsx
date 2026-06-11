export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-11 bg-muted border-b border-border" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-5 w-5 rounded-full bg-muted" />
          <div className="h-4 flex-1 rounded bg-muted" />
          <div className="h-4 w-8 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
