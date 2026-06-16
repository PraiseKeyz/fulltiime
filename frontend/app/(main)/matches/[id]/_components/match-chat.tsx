'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Send, ShieldHalf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Match, ChatMessage } from '@/lib/api/domain'
import { useMe } from '@/lib/api/hooks/auth.hooks'
import { useMatchChat } from '@/lib/api/hooks/fixtures.hooks'

// ─── Match chat ──────────────────────────────────────────────────────────────

function SignInPrompt({ match }: { match: Match }) {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
      <ShieldHalf className="h-8 w-8 text-muted-foreground/30 mx-auto" />
      <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">
        Sign in to ask questions about {match.home_team.short_name ?? match.home_team.name} vs{' '}
        {match.away_team.short_name ?? match.away_team.name}.
      </p>
      <Button asChild variant="primary" size="sm" className="px-4">
        <Link href={`/login?callbackUrl=${encodeURIComponent(`/matches/${match.id}?tab=chat`)}`}>Sign in to chat</Link>
      </Button>
    </div>
  )
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm',
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

export function ChatTab({ match }: { match: Match }) {
  const { data: me, isLoading: meLoading } = useMe()
  const chat = useMatchChat(match.id)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')

  if (meLoading) {
    return <div className="h-48 rounded-xl bg-card border border-border animate-pulse" />
  }
  if (!me) {
    return <SignInPrompt match={match} />
  }

  const home = match.home_team.short_name ?? match.home_team.name
  const away = match.away_team.short_name ?? match.away_team.name

  function send() {
    const content = draft.trim()
    if (!content || chat.isPending) return

    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setDraft('')

    chat.mutate(next, {
      onSuccess: (res) => {
        if (res?.reply) setMessages((curr) => [...curr, { role: 'assistant', content: res.reply }])
      },
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <p className="text-[11px] tracking-tight text-muted-foreground">
          Ask about this match
        </p>
      </div>

      <div className="flex-1 min-h-[16rem] max-h-[28rem] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-[12px] text-muted-foreground/70 text-center py-10">
            Ask anything about {home} vs {away} — the venue, the competition, or how things stand right now.
          </p>
        ) : (
          messages.map((m, i) => <Bubble key={i} message={m} />)
        )}
        {chat.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-border">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          placeholder={`Ask about ${home} vs ${away}…`}
          maxLength={1000}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary"
        />
        <Button
          onClick={send}
          disabled={!draft.trim() || chat.isPending}
          variant="primary"
          size="icon"
          className="h-9 w-9 shrink-0 disabled:opacity-40"
          aria-label="Send"
        >
          <Send />
        </Button>
      </div>
    </div>
  )
}
