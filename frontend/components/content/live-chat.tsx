'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { hashString } from '@/lib/editorial'
import { getChatSocket } from '@/lib/chat-socket'
import { useAuth } from '@/providers/auth-provider'

interface WireMessage {
  id: string
  body: string
  reply_to: string | null
  created_at: string
  user: { id: string; username: string }
}

interface JoinAck {
  history?: WireMessage[]
  fans?: number
  canPost?: boolean
  error?: string
}

const PEEK_PX = 60
const MAX_MESSAGES = 80

function Avatar({ hue, size = 30 }: { hue: number; size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full"
      style={{ width: size, height: size, background: `oklch(0.62 0.13 ${hue})` }}
    />
  )
}

export function LiveChat({ storyId }: { storyId: string }) {
  const { user, isAuthenticated } = useAuth()

  const [messages, setMessages] = useState<WireMessage[]>([])
  const [fans, setFans] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ y: number; h: number; base: number; moved: number; t: number } | null>(null)

  // ── Realtime wiring ─────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getChatSocket()

    const onMessage = (m: WireMessage) =>
      setMessages((prev) => [...prev, m].slice(-MAX_MESSAGES))
    const onPresence = (p: { fans: number }) => setFans(p.fans)
    const join = () =>
      socket.emit('join', { room: storyId }, (res: JoinAck) => {
        if (res?.history) setMessages(res.history)
        if (typeof res?.fans === 'number') setFans(res.fans)
      })

    socket.on('message', onMessage)
    socket.on('presence', onPresence)
    socket.on('connect', join) // also re-joins after reconnects
    if (socket.connected) join()

    return () => {
      socket.emit('leave')
      socket.off('message', onMessage)
      socket.off('presence', onPresence)
      socket.off('connect', join)
    }
  }, [storyId])

  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    if (!isAuthenticated) {
      toast.error('Sign in to join the conversation')
      return
    }
    getChatSocket().emit(
      'message',
      { body: text, reply_to: replyingTo ?? undefined },
      (res: { error?: string }) => {
        if (res?.error) toast.error(res.error)
      },
    )
    // The message comes back through the room broadcast — no local append.
    setDraft('')
    setReplyingTo(null)
  }

  // ── Mobile bottom-sheet drag (ported from the design prototype) ─────────────
  const sheetDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const a = sheetRef.current
    if (!a) return
    dragRef.current = {
      y: e.clientY,
      h: a.offsetHeight,
      base: sheetOpen ? 0 : a.offsetHeight - PEEK_PX,
      moved: 0,
      t: Date.now(),
    }
    a.style.transition = 'none'
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const sheetMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current
    const a = sheetRef.current
    if (!d || !a) return
    d.moved = e.clientY - d.y
    const max = d.h - PEEK_PX
    const ty = Math.min(Math.max(d.base + d.moved, 0), max)
    a.style.transform = `translateY(${ty}px)`
    if (scrimRef.current) {
      const op = 0.55 * (1 - ty / max)
      scrimRef.current.style.opacity = String(op)
      scrimRef.current.style.pointerEvents = op > 0.04 ? 'auto' : 'none'
    }
  }

  const sheetUp = () => {
    const d = dragRef.current
    const a = sheetRef.current
    if (!d || !a) return
    dragRef.current = null
    const dt = Date.now() - d.t
    const vel = d.moved / Math.max(dt, 1)
    let open: boolean
    if (Math.abs(d.moved) < 6 && dt < 320) open = !sheetOpen
    else if (Math.abs(vel) > 0.45) open = vel < 0
    else if (Math.abs(d.moved) > 50) open = d.moved < 0
    else open = sheetOpen
    a.style.transition = ''
    a.style.transform = ''
    if (scrimRef.current) {
      scrimRef.current.style.opacity = ''
      scrimRef.current.style.pointerEvents = ''
    }
    setSheetOpen(open)
  }

  const fansLabel = fans === null ? '…' : String(fans)

  return (
    <>
      {/* Scrim behind the mobile sheet */}
      <div
        ref={scrimRef}
        onClick={() => setSheetOpen(false)}
        className={`fixed inset-0 z-79 bg-black/55 transition-opacity duration-400 sm:hidden ${
          sheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        ref={sheetRef}
        className={`flex flex-col overflow-hidden border border-border bg-background-secondary
          max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-80 max-sm:h-[84vh] max-sm:rounded-t-[20px]
          max-sm:shadow-[0_-18px_50px_rgba(0,0,0,0.55)] max-sm:transition-transform max-sm:duration-400
          max-sm:ease-[cubic-bezier(0.32,0.72,0,1)]
          ${sheetOpen ? 'max-sm:translate-y-0' : 'max-sm:translate-y-[calc(100%-60px)]'}
          sm:h-[calc(100vh-300px)] sm:min-h-[440px] sm:rounded-2xl`}
      >
        {/* Drag handle — mobile only */}
        <button
          onPointerDown={sheetDown}
          onPointerMove={sheetMove}
          onPointerUp={sheetUp}
          onPointerCancel={sheetUp}
          className="flex w-full cursor-grab touch-none select-none flex-col items-center gap-2.25 border-none bg-background-secondary px-4 pt-2.5 pb-3 text-foreground sm:hidden"
        >
          <span className="h-1.25 w-10.5 rounded-full bg-muted-foreground opacity-50" />
          <span className="flex w-full items-center gap-2.75">
            <span className="animate-blip h-2.25 w-2.25 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
            <span className="flex">
              {[20, 205, 300, 150, 45].map((h, i) => (
                <span
                  key={i}
                  className="h-6 w-6 rounded-full border-2 border-background-secondary"
                  style={{ background: `oklch(0.64 0.14 ${h})`, marginLeft: i ? '-8px' : 0 }}
                />
              ))}
            </span>
            <span className="whitespace-nowrap text-[14px] font-bold text-head">
              {sheetOpen ? 'Live conversation' : `${fansLabel} fans here`}
            </span>
            <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] font-semibold text-primary">
              {sheetOpen ? 'swipe down' : 'swipe up'}
              <span className="animate-peek-hint inline-block">{sheetOpen ? '▾' : '▴'}</span>
            </span>
          </span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-border px-4.5 py-4">
          <span className="animate-blip h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          <div className="flex-1">
            <div className="text-[14px] font-bold text-head">
              Reading with {fansLabel} fan{fans === 1 ? '' : 's'}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              live thread · replaces comments
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          data-scroll
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-2"
        >
          {messages.length === 0 && (
            <div className="py-10 text-center font-mono text-[12px] text-muted-foreground">
              Nothing yet — be the first to say something.
            </div>
          )}
          {messages.map((m) => {
            const you = m.user.id === user?.id
            return (
              <div key={m.id} className="animate-message-in flex gap-2.5">
                <Avatar hue={hashString(m.user.username) % 360} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 font-mono text-[12px] font-bold text-foreground">
                    {you ? 'You' : m.user.username}
                  </div>
                  {m.reply_to && (
                    <div className="mb-1.25 border-l-2 border-primary/40 pl-1.75 font-mono text-[11px] text-muted-foreground">
                      ↳ replying to {m.reply_to}
                    </div>
                  )}
                  <div
                    className={`rounded-[4px_12px_12px_12px] border px-3 py-2.25 text-[14px] leading-[1.45] text-foreground ${
                      you ? 'border-primary/40 bg-primary/15' : 'border-border bg-background'
                    }`}
                  >
                    {m.body}
                  </div>
                  <button
                    onClick={() => setReplyingTo(m.user.username)}
                    className="pt-1.25 font-mono text-[11px] text-muted-foreground hover:text-primary"
                  >
                    reply
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Composer */}
        <div className="border-t border-border px-3.5 py-3">
          {replyingTo && (
            <div className="mb-2 flex items-center justify-between rounded-[7px] bg-primary/8 px-2.5 py-1.5 font-mono text-[11px] text-primary">
              <span>↳ replying to {replyingTo}</span>
              <button
                onClick={() => setReplyingTo(null)}
                aria-label="Cancel reply"
                className="text-[14px] text-muted-foreground"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={
                isAuthenticated ? 'Add to the conversation…' : 'Sign in to join the conversation…'
              }
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-3.75 py-2.75 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              onClick={send}
              aria-label="Send"
              className="h-10.5 w-10.5 shrink-0 rounded-full bg-primary text-[16px] text-primary-foreground"
            >
              ↑
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
