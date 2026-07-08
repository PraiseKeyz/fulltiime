'use client'

import { useEffect, useState } from 'react'

interface Grid {
  W: number
  H: number
  vx: number[]
  hy: number[]
}

/**
 * Decorative blueprint overlay from the Fulltiime design: vertical rules at the
 * content edges, horizontal rules at each section boundary, and "+" crosshair
 * marks at the intersections. Sits behind the page (z-index -1), never
 * intercepts pointer events.
 */
export function BlueprintGrid() {
  const [grid, setGrid] = useState<Grid | null>(null)

  useEffect(() => {
    let raf = 0

    const measure = () => {
      const doc = document.documentElement
      const W = doc.clientWidth
      const H = document.body.scrollHeight
      const cw = Math.min(1280, W)
      const cl = Math.round((W - cw) / 2)
      const inset = W <= 640 ? 4 : 24
      const vx = [cl + inset, cl + cw - inset]

      const ys = new Set<number>()
      document.querySelectorAll<HTMLElement>('[data-bp]').forEach((el) => {
        const y = Math.round(el.getBoundingClientRect().top + window.scrollY)
        if (y > 0 && y < H - 2) ys.add(y)
      })
      const hy = Array.from(ys).sort((a, b) => a - b)

      setGrid((prev) => {
        const next = { W, H, vx, hy }
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      })
    }

    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    schedule()
    const t = setTimeout(schedule, 650)
    window.addEventListener('resize', schedule)
    const ro = new ResizeObserver(schedule)
    ro.observe(document.body)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      window.removeEventListener('resize', schedule)
      ro.disconnect()
    }
  }, [])

  if (!grid) return null

  const s = 4
  const line = 'color-mix(in srgb, var(--foreground) 10%, transparent)'
  const mark = 'color-mix(in srgb, var(--foreground) 34%, transparent)'

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg
        width={grid.W}
        height={grid.H}
        shapeRendering="crispEdges"
        className="absolute left-0 top-0"
      >
        {grid.vx.map((x, i) => (
          <line key={`v${i}`} x1={x} y1={0} x2={x} y2={grid.H} stroke={line} strokeWidth={1} />
        ))}
        {grid.hy.map((y, i) => (
          <line key={`h${i}`} x1={0} y1={y} x2={grid.W} y2={y} stroke={line} strokeWidth={1} />
        ))}
        {grid.vx.map((x, i) =>
          grid.hy.map((y, j) => (
            <path
              key={`p${i}_${j}`}
              d={`M${x - s} ${y} H${x + s} M${x} ${y - s} V${y + s}`}
              stroke={mark}
              strokeWidth={1}
            />
          )),
        )}
      </svg>
    </div>
  )
}
