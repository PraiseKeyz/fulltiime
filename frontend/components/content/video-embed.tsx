'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { youtubeId } from '@/lib/youtube'

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: Record<string, unknown>) => { destroy: () => void } }
    onYouTubeIframeAPIReady?: () => void
  }
}

// Codes YouTube fires on the *player*, not the network — the request always
// succeeds, the owner just disabled embedding (101/150) or pulled the video
// (100). Anything else we don't treat as fatal.
const UNPLAYABLE_CODES = new Set([100, 101, 150])

let apiReady: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (!apiReady) {
    apiReady = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve()
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    })
  }
  return apiReady
}

/**
 * Plays the video when the owner allows embedding; falls back to a
 * "Watch on YouTube" card when they don't (common for broadcaster-owned
 * highlight clips — UEFA, Premier League, etc. routinely block embeds).
 * The mount div is rendered unconditionally so the YouTube API's direct DOM
 * swap (div → iframe) never fights React's reconciliation.
 */
export function VideoEmbed({
  videoUrl,
  title,
  coverSrc,
  className,
}: {
  videoUrl: string
  title: string
  coverSrc?: string | null
  className?: string
}) {
  const id = youtubeId(videoUrl)
  const mountRef = useRef<HTMLDivElement>(null)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (!id || !mountRef.current) return
    let cancelled = false
    let player: { destroy: () => void } | undefined

    loadYouTubeApi().then(() => {
      if (cancelled || !mountRef.current || !window.YT) return
      player = new window.YT.Player(mountRef.current, {
        videoId: id,
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onError: (e: { data: number }) => {
            if (UNPLAYABLE_CODES.has(e.data)) setBlocked(true)
          },
        },
      })
    })

    return () => {
      cancelled = true
      player?.destroy()
    }
  }, [id])

  if (!id) return null

  return (
    <div className={cn('relative overflow-hidden bg-black', className)}>
      <div ref={mountRef} className="h-full w-full" />
      {blocked && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85"
        >
          {coverSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverSrc} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
          )}
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black">
            <Play className="h-6 w-6 fill-current pl-0.5" />
          </span>
          <span className="text-center text-[13px] font-bold text-white">
            {title}
            <span className="mt-1 block font-mono text-[11px] font-normal text-white/70">
              Not available for embedding here — watch on YouTube ↗
            </span>
          </span>
        </a>
      )}
    </div>
  )
}
