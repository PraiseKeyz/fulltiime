'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Send, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Match } from '@/lib/api/domain'
import { useMe } from '@/lib/api/hooks/auth.hooks'
import { useLiveChat, type LiveChatMessage } from '@/lib/live-chat/use-live-chat'

// ─── Input area variants ───────────────────────────────────────────────────────

function SignInNudge({ match }: { match: Match }) {
  const href = `/login?callbackUrl=${encodeURIComponent(`/matches/${match.id}?tab=banter`)}`
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border shrink-0">
      <p className="text-[12px] text-muted-foreground">
        <Link href={href} className="font-bold text-primary hover:underline">Sign in</Link>{' '}
        to join the conversation.
      </p>
      <Button asChild variant="primary" size="sm" className="shrink-0 px-3 h-8 text-[12px]">
        <Link href={href}>Sign in</Link>
      </Button>
    </div>
  )
}

function ChatInput({
  draft, setDraft, onSend, connected,
}: {
  draft: string
  setDraft: (v: string) => void
  onSend: () => void
  connected: boolean
}) {
  return (
    <div className="flex items-center gap-2 p-3 border-t border-border shrink-0">
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
        placeholder="Say something…"
        maxLength={500}
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary"
      />
      <Button
        onClick={onSend}
        disabled={!draft.trim() || !connected}
        variant="primary"
        size="icon"
        className="h-9 w-9 shrink-0 disabled:opacity-40"
        aria-label="Send"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ─── Message bubble ────────────────────────────────────────────────────────────

function MessageRow({ msg, isOwn }: { msg: LiveChatMessage; isOwn: boolean }) {
  return (
    <div className={cn('flex flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}>
      {!isOwn && (
        <span className="text-[10px] font-semibold text-muted-foreground px-1">
          {msg.user.username}
        </span>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed break-words',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm',
        )}
      >
        {msg.content}
      </div>
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function LiveChatTab({ match }: { match: Match }) {
  const { data: me, isLoading: meLoading } = useMe()
  const { messages, connected, error, send } = useLiveChat(match.id, !meLoading)

  const [draft, setDraft] = useState('')
  const bottomRef         = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function handleSend() {
    const content = draft.trim()
    if (!content) return
    send(content)
    setDraft('')
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-[480px]">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
          Fullchat
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {connected
            ? <Wifi    className="h-3.5 w-3.5 text-green-500" />
            : <WifiOff className="h-3.5 w-3.5 text-muted-foreground/40" />
          }
          <span className="text-[10px] text-muted-foreground">
            {connected ? 'Connected' : 'Connecting…'}
          </span>
        </span>
      </div>

      {/* Message list — visible to everyone */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
        {messages.length === 0 && (
          <p className="text-[12px] text-muted-foreground/60 text-center py-10">
            No messages yet — be the first to say something!
          </p>
        )}
        {messages.map(msg => (
          <MessageRow key={msg.id} msg={msg} isOwn={msg.user.id === (me?.id ?? '')} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Error toast */}
      {error && (
        <p className="px-4 py-1.5 text-[11px] text-destructive border-t border-border shrink-0">
          {error}
        </p>
      )}

      {/* Input — gated on auth; guests see a sign-in nudge instead */}
      {meLoading ? (
        <div className="h-[52px] border-t border-border shrink-0" />
      ) : me ? (
        <ChatInput
          draft={draft}
          setDraft={setDraft}
          onSend={handleSend}
          connected={connected}
        />
      ) : (
        <SignInNudge match={match} />
      )}
    </div>
  )
}
