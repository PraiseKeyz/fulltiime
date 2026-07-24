'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, Square, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stripHtml } from '@/lib/editorial'

const RATES = [0.75, 1, 1.25, 1.5]

/**
 * "Listen to this article" — the browser's own Web Speech API, so there's no
 * backend cost and no audio file to generate or store. Two real quirks of
 * that API shape this component:
 *
 * 1. Chrome silently kills speech after ~15s on longer text unless the
 *    engine is kept "busy" — the standard workaround is a pause/resume
 *    heartbeat while actively playing.
 * 2. There's no seek and no way to change the rate of an in-flight
 *    utterance, so switching speed restarts from the top with the new rate.
 */
export function ArticleAudio({ title, html }: { title: string; html: string }) {
  const text = useMemo(() => `${title}. ${stripHtml(html)}`, [title, html])

  const [supported, setSupported] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(1)

  const heartbeat = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => {
      if (heartbeat.current) clearInterval(heartbeat.current)
      window.speechSynthesis?.cancel()
    }
  }, [])

  const stopHeartbeat = () => {
    if (heartbeat.current) {
      clearInterval(heartbeat.current)
      heartbeat.current = null
    }
  }

  const speak = (atRate: number) => {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = atRate
    utterance.lang = 'en-US'
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'))
    if (voice) utterance.voice = voice

    utterance.onstart = () => {
      setPlaying(true)
      setPaused(false)
      stopHeartbeat()
      heartbeat.current = setInterval(() => {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }, 10_000)
    }
    utterance.onend = () => {
      stopHeartbeat()
      setPlaying(false)
      setPaused(false)
    }
    utterance.onerror = () => {
      stopHeartbeat()
      setPlaying(false)
      setPaused(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const togglePlayPause = () => {
    if (!playing) {
      speak(rate)
    } else if (paused) {
      window.speechSynthesis.resume()
      setPaused(false)
      heartbeat.current = setInterval(() => {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }, 10_000)
    } else {
      stopHeartbeat()
      window.speechSynthesis.pause()
      setPaused(true)
    }
  }

  const stop = () => {
    stopHeartbeat()
    window.speechSynthesis.cancel()
    setPlaying(false)
    setPaused(false)
  }

  const changeRate = (next: number) => {
    setRate(next)
    // No seek in the Web Speech API — a rate change restarts from the top.
    if (playing) speak(next)
  }

  if (!supported) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 border border-border bg-background-secondary px-4 py-3">
      <button
        onClick={togglePlayPause}
        aria-label={playing && !paused ? 'Pause' : 'Play'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        {playing && !paused ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current pl-0.5" />
        )}
      </button>

      <span className="flex items-center gap-1.5 font-mono text-[12px] text-txt2">
        <Headphones className="h-3.5 w-3.5" />
        {playing ? (paused ? 'Paused' : 'Listening…') : 'Listen to this article'}
      </span>

      {playing && (
        <button
          onClick={stop}
          aria-label="Stop"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-txt2 transition-colors hover:border-primary hover:text-primary"
        >
          <Square className="h-3 w-3 fill-current" />
        </button>
      )}

      <div className="ml-auto flex items-center gap-1">
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => changeRate(r)}
            className={cn(
              'rounded-full border px-2.5 py-1 font-mono text-[11px] font-bold transition-colors',
              rate === r
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
            )}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  )
}
