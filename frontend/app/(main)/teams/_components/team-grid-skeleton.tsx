export function TeamGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-36 rounded-xl border border-border bg-muted animate-pulse" />
      ))}
    </div>
  )
}
