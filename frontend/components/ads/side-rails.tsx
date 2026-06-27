'use client'

import { useEffect, useRef, useState } from 'react'
import { AdSlot } from './ad-slot'

// Where the rails start from the top of the viewport (clears the navbar and sits
// roughly level with the content), and the gap kept above the footer.
const TOP_OFFSET = 96
const FOOTER_GAP = 16

// Permanent skyscraper rails that hug the left/right edges of the centred content
// column (not the screen edges) — the FotMob layout. Rendered once in the root
// layout, so they persist across navigation; only the creative changes per page
// (resolved inside AdSlot via zone.byRoute).
//
// Each rail container fills its gutter — `(100vw - content) / 2` — so the creative
// can scale to fit, while `align` pins it to the inner (content-facing) edge. They
// sit fixed near the top while the page scrolls, then get lifted clear once the
// footer scrolls into view, so the footer is never covered. Hidden below 1400px,
// where the gutter is too narrow.
export function SideRails() {
  const railRef = useRef<HTMLDivElement>(null)
  const [lift, setLift] = useState(0)

  useEffect(() => {
    const footer = document.querySelector('footer')
    let frame = 0

    const compute = () => {
      frame = 0
      const railH = railRef.current?.offsetHeight ?? 0
      const railBottom = TOP_OFFSET + railH
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity
      const overlap = railBottom + FOOTER_GAP - footerTop
      setLift(overlap > 0 ? overlap : 0)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const style = { top: TOP_OFFSET, transform: lift ? `translateY(-${lift}px)` : undefined }

  return (
    <div className="hidden min-[1400px]:block">
      {/* Left rail — creative pinned to the RIGHT (content-facing) edge of the gutter */}
      <div
        ref={railRef}
        style={style}
        className="fixed left-0 z-40 w-[calc((100vw-var(--content-max))/2)] pr-4"
      >
        <AdSlot zone="rail-left" align="end" className="w-full" />
      </div>
      {/* Right rail — creative pinned to the LEFT (content-facing) edge of the gutter */}
      <div
        style={style}
        className="fixed right-0 z-40 w-[calc((100vw-var(--content-max))/2)] pl-4"
      >
        <AdSlot zone="rail-right" align="start" className="w-full" />
      </div>
    </div>
  )
}
