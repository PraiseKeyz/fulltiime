import { cn } from '@/lib/utils'
import { hueFor, photoGradient } from '@/lib/editorial'

/**
 * Story art. Renders a real cover image when one exists, otherwise the
 * design's deterministic hue gradient — cards never show an empty grey box.
 */
export function Cover({
  src,
  seed,
  hue,
  alt = '',
  className,
}: {
  src?: string | null
  seed: string
  /** Explicit design hue; falls back to a hash of `seed`. */
  hue?: number
  alt?: string
  className?: string
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {src ? (
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={photoGradient(hue ?? hueFor(seed))} />
      )}
    </div>
  )
}
