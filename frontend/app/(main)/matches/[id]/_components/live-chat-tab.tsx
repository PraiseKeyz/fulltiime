'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from 'react'
import Link from 'next/link'
import { Send, CornerUpLeft, X, Plus, Mic, Play, Pause, Keyboard, Image as ImageIcon, Dices, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Match } from '@/lib/api/domain'
import { useMe } from '@/lib/api/hooks/auth.hooks'
import { useLiveChat, uploadChatAttachment, type LiveChatMessage } from '@/lib/live-chat/use-live-chat'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}


interface KnownUser { id: string; username: string }

function knownUsersFrom(messages: LiveChatMessage[]): KnownUser[] {
  const seen = new Map<string, KnownUser>()
  for (const m of messages) {
    if (!seen.has(m.user.id)) seen.set(m.user.id, { id: m.user.id, username: m.user.username })
  }
  return [...seen.values()]
}

function mentionsUser(content: string, username: string | undefined): boolean {
  if (!username) return false
  return new RegExp(`@${username}\\b`, 'i').test(content)
}

function renderWithMentions(content: string, currentUsername?: string) {
  return content.split(/(@\w+)/g).map((part, i) => {
    if (!part.startsWith('@')) return part
    const isMe = !!currentUsername && part.slice(1).toLowerCase() === currentUsername.toLowerCase()
    return (
      <span key={i} className={cn('font-bold', isMe ? 'text-primary' : 'text-foreground')}>
        {part}
      </span>
    )
  })
}

// ─── Input area variants ───────────────────────────────────────────────────────

function SignInNudge({ match }: { match: Match }) {
  const href = `/login?callbackUrl=${encodeURIComponent(`/matches/${match.id}?tab=banter`)}`
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border shrink-0">
      <p className="text-[13px] text-muted-foreground">
        <Link href={href} className="font-bold text-primary hover:underline">Sign in</Link>{' '}
        to join the conversation.
      </p>
    </div>
  )
}

function ChatInput({
  draft, setDraft, onSend, onSendImage, onSendVoice, connected, knownUsers, replyTo, onCancelReply, uploading,
}: {
  draft: string
  setDraft: (v: string) => void
  onSend: () => void
  onSendImage: (file: File, caption: string) => void
  onSendVoice: (blob: Blob, durationSec: number) => void
  connected: boolean
  knownUsers: KnownUser[]
  replyTo: LiveChatMessage | null
  onCancelReply: () => void
  uploading: boolean
}) {
  const inputRef    = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [highlightIdx, setHighlightIdx] = useState(0)


  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null)


  const [attachMenuOpen, setAttachMenuOpen] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [recordError, setRecordError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const streamRef        = useRef<MediaStream | null>(null)
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)

  const audioContextRef  = useRef<AudioContext | null>(null)
  const analyserRef      = useRef<AnalyserNode | null>(null)
  const rafRef           = useRef<number | null>(null)
  const barsContainerRef = useRef<HTMLDivElement>(null)
  const BAR_COUNT = 28

  function stopWaveform() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    analyserRef.current = null
    audioContextRef.current?.close().catch(() => {})
    audioContextRef.current = null
  }

  function startWaveform(stream: MediaStream) {
    const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext
    const audioContext = new AudioCtx()
    const source   = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 64
    source.connect(analyser)
    audioContextRef.current = audioContext
    analyserRef.current = analyser

    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteFrequencyData(data)
      const bars = barsContainerRef.current?.children
      if (bars) {
        for (let i = 0; i < bars.length; i++) {
          const value  = data[i % data.length]
          const height = Math.max(3, Math.round((value / 255) * 26))
          ;(bars[i] as HTMLElement).style.height = `${height}px`
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      stopWaveform()
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl)
    }
  }, [])

  const suggestions = mentionQuery === null
    ? []
    : knownUsers
        .filter(u => u.username.toLowerCase().startsWith(mentionQuery.toLowerCase()))
        .slice(0, 6)

  function detectMention(value: string, caret: number) {
    const match = value.slice(0, caret).match(/@(\w*)$/)
    setMentionQuery(match ? match[1] : null)
    setHighlightIdx(0)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setDraft(e.target.value)
    detectMention(e.target.value, e.target.selectionStart ?? e.target.value.length)
  }

  function applyMention(username: string) {
    const el = inputRef.current
    const caret = el?.selectionStart ?? draft.length
    const upToCaret = draft.slice(0, caret)
    const replaced = upToCaret.replace(/@(\w*)$/, `@${username} `)
    const next = replaced + draft.slice(caret)
    setDraft(next)
    setMentionQuery(null)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(replaced.length, replaced.length)
    })
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (mentionQuery !== null && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => (i + 1) % suggestions.length); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlightIdx(i => (i - 1 + suggestions.length) % suggestions.length); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyMention(suggestions[highlightIdx].username); return }
      if (e.key === 'Escape') { setMentionQuery(null); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendClick() }
  }

  function handlePickImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl)
    setPendingImage(file)
    setPendingPreviewUrl(URL.createObjectURL(file))
  }

  function cancelPendingImage() {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl)
    setPendingImage(null)
    setPendingPreviewUrl(null)
  }

  function handleSendClick() {
    if (pendingImage) {
      onSendImage(pendingImage, draft.trim())
      cancelPendingImage()
      setDraft('')
      return
    }
    onSend()
  }

  async function startRecording() {
    setRecordError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
      startWaveform(stream)
    } catch {
      setRecordError('Microphone access denied.')
    }
  }

  function stopRecording(shouldSend: boolean) {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    const duration = recordSeconds

    recorder.onstop = () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      if (shouldSend && chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        onSendVoice(blob, duration)
      }
      chunksRef.current = []
    }
    recorder.stop()
    mediaRecorderRef.current = null
    stopWaveform()

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setIsRecording(false)
    setRecordSeconds(0)
  }

  const showMic = !draft.trim() && !pendingImage && !isRecording

  return (
    <div className="relative shrink-0 bg-card -mx-4 lg:-mx-6 py-1">
      {replyTo && (
        <div className="flex items-center gap-2 px-4 lg:px-6 pt-2.5">
          <div className="flex-1 min-w-0 rounded-lg border-l-2 border-primary bg-muted px-2.5 py-1.5">
            <p className="text-[10px] font-bold text-primary">{replyTo.user.username}</p>
            <p className="text-[12px] text-muted-foreground truncate">{replyTo.content}</p>
          </div>
          <Button
            onClick={onCancelReply}
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground"
            aria-label="Cancel reply"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {pendingImage && pendingPreviewUrl && (
        <div className="flex items-center gap-2 px-4 lg:px-6 pt-2.5">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border">
            <img src={pendingPreviewUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <p className="flex-1 min-w-0 truncate text-[12px] text-muted-foreground">Add a caption…</p>
          <Button
            onClick={cancelPendingImage}
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {recordError && (
        <p className="px-4 lg:px-6 pt-2 text-[11px] text-destructive">{recordError}</p>
      )}

      {mentionQuery !== null && suggestions.length > 0 && (
        <div className="absolute bottom-full left-4 lg:left-6 right-4 lg:right-6 mb-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-10">
          {suggestions.map((u, i) => (
            <button
              key={u.id}
              type="button"
              onClick={() => applyMention(u.username)}
              className={cn(
                'flex w-full items-center px-3 py-2 text-[13px] text-left font-semibold',
                i === highlightIdx ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground',
              )}
            >
              @{u.username}
            </button>
          ))}
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center gap-3 py-3 px-4 lg:px-6">
          <Button
            onClick={() => stopRecording(false)}
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-destructive"
            aria-label="Cancel recording"
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="h-2 w-2 shrink-0 rounded-full bg-live animate-pulse" />
          <div ref={barsContainerRef} className="flex flex-1 items-center gap-[2px] overflow-hidden">
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <span key={i} className="w-[2.5px] shrink-0 rounded-full bg-live transition-[height] duration-100 ease-out" style={{ height: '3px' }} />
            ))}
          </div>
          <span className="shrink-0 text-[12px] font-semibold tabular-nums text-muted-foreground">
            {String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:{String(recordSeconds % 60).padStart(2, '0')}
          </span>
          <Button
            onClick={() => stopRecording(true)}
            variant="primary"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Send voice message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-3 px-4 lg:px-6">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
          <Button
            onClick={() => setAttachMenuOpen(o => !o)}
            variant="ghost"
            size="icon"
            className="h-12 w-12 shrink-0 text-muted-foreground"
            aria-label={attachMenuOpen ? 'Close attachment menu' : 'Attach'}
            disabled={uploading}
          >
            {attachMenuOpen ? <Keyboard className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
          </Button>
          <input
            ref={inputRef}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setAttachMenuOpen(false)}
            placeholder={pendingImage ? 'Add a caption…' : 'Say something… (@ to mention)'}
            maxLength={500}
            className="flex-1 rounded-xl bg-background px-3 py-3 text-[13px] outline-none focus:ring-1 focus:ring-primary"
          />
          {showMic ? (
            <Button
              onClick={startRecording}
              disabled={!connected || uploading}
              variant="primary"
              size="icon"
              className="h-9 w-9 shrink-0 disabled:opacity-40"
              aria-label="Record voice message"
            >
              <Mic className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSendClick}
              disabled={(!draft.trim() && !pendingImage) || !connected || uploading}
              variant="primary"
              size="icon"
              className="h-9 w-9 shrink-0 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Attach sheet — slides up below the input row, doesn't replace it */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-250 ease-out',
          attachMenuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-4 gap-3 px-4 lg:px-6 py-4">
            <button
              type="button"
              onClick={() => { fileInputRef.current?.click(); setAttachMenuOpen(false) }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <ImageIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold text-foreground">Photos</span>
            </button>

            <div className="flex flex-col items-center gap-1.5 opacity-40" aria-disabled>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Dices className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">Bet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Voice message playback ─────────────────────────────────────────────────

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const PLAYBACK_BAR_COUNT = 28

function AudioBubble({ url, duration }: { url: string; duration: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration ?? 0)

  const [barHeights] = useState(() =>
    Array.from({ length: PLAYBACK_BAR_COUNT }, () => 4 + Math.round(Math.random() * 18)),
  )

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.pause()
    else audio.play()
  }


  function handleEnded() {
    setPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) audioRef.current.currentTime = 0
  }

  const filledBars = totalDuration > 0
    ? Math.round((currentTime / totalDuration) * PLAYBACK_BAR_COUNT)
    : 0

  return (
    <div className="flex min-w-[190px] items-center gap-2 py-0.5">
      <audio
        ref={audioRef}
        src={url}
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setTotalDuration(e.currentTarget.duration)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <div className="flex h-7 flex-1 items-center gap-[2px] overflow-hidden">
        {barHeights.map((h, i) => (
          <span
            key={i}
            className={cn(
              'w-[2.5px] shrink-0 rounded-full transition-colors duration-200 ease-out',
              i < filledBars ? 'bg-primary' : 'bg-foreground/20',
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
        {fmtTime(playing || currentTime > 0 ? currentTime : totalDuration)}
      </span>
    </div>
  )
}

// ─── Message bubble ────────────────────────────────────────────────────────────

function jumpToMessage(id: string) {
  const el = document.getElementById(`chat-msg-${id}`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('bg-primary/10')
  setTimeout(() => el.classList.remove('bg-primary/10'), 900)
}

const SWIPE_SLOP      = 8
const SWIPE_THRESHOLD = 56
const SWIPE_MAX       = 80

function useSwipeToReply(onTrigger: () => void) {
  const [dragX, setDragX] = useState(0)
  const start    = useRef<{ x: number; y: number } | null>(null)
  const dragging = useRef(false)
  const triggered = useRef(false)

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    start.current = { x: e.clientX, y: e.clientY }
    dragging.current = false
    triggered.current = false
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y

    if (!dragging.current) {
      if (Math.abs(dx) < SWIPE_SLOP && Math.abs(dy) < SWIPE_SLOP) return
      if (Math.abs(dy) > Math.abs(dx)) {
        start.current = null
        return
      }
      dragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    e.preventDefault()
    const clamped = Math.max(0, Math.min(dx, SWIPE_MAX))
    setDragX(clamped)
    if (clamped >= SWIPE_THRESHOLD && !triggered.current) {
      triggered.current = true
      onTrigger()
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8)
    }
  }

  function endDrag() {
    start.current = null
    dragging.current = false
    setDragX(0)
  }

  return {
    dragX,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp:     endDrag,
      onPointerCancel: endDrag,
    },
  }
}

function MessageRow({
  msg, isOwn, currentUsername, onReply, isNew, pending,
}: {
  msg: LiveChatMessage
  isOwn: boolean
  currentUsername?: string
  onReply: (msg: LiveChatMessage) => void
  isNew: boolean
  pending?: boolean
}) {
  const mentionedMe = !isOwn && mentionsUser(msg.content, currentUsername)
  const { dragX, handlers } = useSwipeToReply(() => onReply(msg))
  const [playEntrance] = useState(isNew)

  return (
    <div
      id={`chat-msg-${msg.id}`}
      className={cn(
        'group relative flex w-fit max-w-[80%]',
        isOwn && 'ml-auto -mr-3.5',
        playEntrance && 'animate-message-in',
      )}
    >
      {/* Reply affordance, revealed from underneath as the row is dragged right */}
      <div
        className="absolute inset-y-0 left-0 flex items-center pl-1 text-primary"
        style={{ opacity: dragX / SWIPE_THRESHOLD }}
      >
        <CornerUpLeft className="h-4 w-4" />
      </div>

      <div
        {...(pending ? {} : handlers)}
        style={{
          transform:  `translateX(${dragX}px)`,
          transition: dragX === 0 ? 'transform 150ms ease-out' : undefined,
        }}
        className="flex items-end gap-2 touch-pan-y select-none"
      >
        {!isOwn && (
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={msg.user.avatar_url ?? undefined} alt={msg.user.username} />
            <AvatarFallback className="text-[10px]">{getInitials(msg.user.username)}</AvatarFallback>
          </Avatar>
        )}
        <div className={cn('flex items-center gap-0.5 min-w-0', isOwn && 'flex-row-reverse')}>
          {isOwn && (
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 self-end items-center justify-center rounded-full border',
                pending
                  ? 'border-muted-foreground/30'
                  : 'border-primary/40 bg-primary/15',
              )}
            >
              {!pending && <Check className="h-2.5 w-2.5 text-primary" />}
            </span>
          )}

          <div
            className={cn(
              'min-w-0 rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed break-words text-foreground border border-border',
              isOwn
                ? 'bg-card-hover rounded-br-sm'
                : mentionedMe
                  ? 'bg-card rounded-bl-sm ring-1 ring-primary/40'
                  : 'bg-card rounded-bl-sm',
              pending && 'opacity-70',
            )}
          >
            {msg.reply_to && (
              <button
                type="button"
                onClick={() => jumpToMessage(msg.reply_to!.id)}
                className={cn(
                  'block w-full text-left mb-1.5 rounded border-l-2 px-2 py-1 text-[11px]',
                  isOwn
                    ? 'border-foreground/30 bg-foreground/5'
                    : 'border-primary bg-background/60',
                )}
              >
                <p className={cn('font-bold', isOwn ? 'text-foreground/80' : 'text-primary')}>
                  {msg.reply_to.user.username}
                </p>
                <p className="truncate opacity-80">{msg.reply_to.content}</p>
              </button>
            )}
            {msg.attachment_url && msg.attachment_type === 'IMAGE' && (
              <img
                src={msg.attachment_url}
                alt=""
                className={cn('max-h-[280px] max-w-[220px] rounded-lg object-cover', msg.content && 'mb-1.5')}
              />
            )}
            {msg.attachment_url && msg.attachment_type === 'AUDIO' && (
              <AudioBubble url={msg.attachment_url} duration={msg.attachment_duration} />
            )}
            {msg.content && renderWithMentions(msg.content, currentUsername)}
          </div>

          {!pending && (
            <button
              type="button"
              onClick={() => onReply(msg)}
              aria-label="Reply"
              className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              <CornerUpLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

function buildOptimisticMessage(
  tempId: string,
  content: string,
  user: LiveChatMessage['user'],
  replyTo: LiveChatMessage | null,
): LiveChatMessage {
  return {
    id: tempId,
    content,
    attachment_url: null,
    attachment_type: null,
    attachment_duration: null,
    created_at: new Date().toISOString(),
    user,
    reply_to: replyTo
      ? { id: replyTo.id, content: replyTo.content, user: { username: replyTo.user.username } }
      : null,
  }
}

export function LiveChatTab({ match }: { match: Match }) {
  const { data: me, isLoading: meLoading } = useMe()
  const { messages, connected, error, send, liveIds } = useLiveChat(match.id, !meLoading)

  const [draft, setDraft]         = useState('')
  const [replyTo, setReplyTo]     = useState<LiveChatMessage | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [pending, setPending] = useState<LiveChatMessage[]>([])
  const listRef                = useRef<HTMLDivElement>(null)

  const knownUsers = useMemo(() => knownUsersFrom(messages), [messages])
  const displayMessages = useMemo(() => [...messages, ...pending], [messages, pending])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [displayMessages.length])

  // Once a confirmed message from this same user with the same text shows up
  // in `messages`, the optimistic placeholder has done its job — drop it so
  // the real one (with reply-jump support etc.) takes over.
  useEffect(() => {
    if (!me || pending.length === 0) return
    setPending(prev => prev.filter(p =>
      !messages.some(m => m.user.id === me.id && m.content === p.content),
    ))
  }, [messages, me, pending.length])

  function handleSend() {
    const content = draft.trim()
    if (!content || !me) return

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setPending(prev => [...prev, buildOptimisticMessage(tempId, content, me, replyTo)])

    send(content, { replyToId: replyTo?.id })
    setDraft('')
    setReplyTo(null)

    // Safety net — if the server never confirms (dropped connection, etc.),
    // don't leave it looking like it's sending forever.
    setTimeout(() => {
      setPending(prev => prev.filter(p => p.id !== tempId))
    }, 15_000)
  }

  async function handleSendImage(file: File, caption: string) {
    setUploading(true)
    setUploadError(null)
    try {
      const att = await uploadChatAttachment(file, file.name)
      send(caption, { replyToId: replyTo?.id, attachmentUrl: att.url, attachmentType: att.type })
      setReplyTo(null)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Failed to send image.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSendVoice(blob: Blob, durationSec: number) {
    setUploading(true)
    setUploadError(null)
    try {
      const att = await uploadChatAttachment(blob, `voice-${Date.now()}.webm`, durationSec)
      send('', { replyToId: replyTo?.id, attachmentUrl: att.url, attachmentType: att.type, attachmentDuration: durationSec })
      setReplyTo(null)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Failed to send voice message.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-background flex flex-col h-full">

      {/* Message list — visible to everyone */}
      <div ref={listRef} className="flex-1 overflow-y-auto flex flex-col justify-end gap-3 p-4 scrollbar-none">
        {displayMessages.length === 0 && (
          <p className="text-[12px] text-muted-foreground/60 text-center py-10">
            No messages yet — be the first to say something!
          </p>
        )}
        {displayMessages.map(msg => {
          const isPending = pending.some(p => p.id === msg.id)
          return (
            <MessageRow
              key={msg.id}
              msg={msg}
              isOwn={msg.user.id === (me?.id ?? '')}
              currentUsername={me?.username}
              onReply={setReplyTo}
              isNew={!isPending && liveIds.has(msg.id)}
              pending={isPending}
            />
          )
        })}
      </div>

      {/* Error toast */}
      {(error || uploadError) && (
        <p className="px-4 py-1.5 text-[11px] text-destructive border-t border-border shrink-0">
          {error || uploadError}
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
          onSendImage={handleSendImage}
          onSendVoice={handleSendVoice}
          uploading={uploading}
          connected={connected}
          knownUsers={knownUsers}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      ) : (
        <SignInNudge match={match} />
      )}
    </div>
  )
}
