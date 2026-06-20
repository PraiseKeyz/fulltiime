'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export type ChatAttachmentType = 'IMAGE' | 'AUDIO'

export interface LiveChatMessage {
  id:                  string
  content:             string
  attachment_url:      string | null
  attachment_type:     ChatAttachmentType | null
  attachment_duration: number | null
  created_at:          string
  user: {
    id:         string
    username:   string
    avatar_url: string | null
  }
  reply_to: {
    id:      string
    content: string
    user:    { username: string }
  } | null
}

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export interface UploadedAttachment {
  url:      string
  type:     ChatAttachmentType
  duration: number | null
}

// REST, not socket — binary upload over a websocket is more trouble than it's
// worth. Upload first, get back a URL, then send that URL over the socket like
// any other message field.
export async function uploadChatAttachment(file: Blob, filename: string, duration?: number): Promise<UploadedAttachment> {
  const form = new FormData()
  form.append('file', file, filename)
  if (duration != null) form.append('duration', String(Math.round(duration)))

  const res = await fetch(`${WS_URL}/api/v1/live-chat/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Upload failed')
  }
  const json = await res.json()
  const data = json.data as { url: string; type: ChatAttachmentType; duration: number | null }
  return { url: `${WS_URL}${data.url}`, type: data.type, duration: data.duration }
}

export function useLiveChat(matchId: string, enabled = true) {
  const socketRef                                          = useRef<Socket | null>(null)
  const [messages, setMessages]                           = useState<LiveChatMessage[]>([])
  const [connected, setConnected]                         = useState(false)
  const [error, setError]                                 = useState<string | null>(null)

  // Ids that arrived via the live 'message' event (not the initial history
  // snapshot) — lets the UI animate only genuinely new messages in, not the
  // whole history batch on join. A ref, not state: it only needs to be read
  // at the same time `messages` changes, which is exactly when it's mutated.
  const liveIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled || !matchId) return

    liveIds.current = new Set()

    const socket = io(`${WS_URL}/live-chat`, {
      withCredentials: true,  // send the access_token cookie
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect',    ()        => setConnected(true))
    socket.on('disconnect', ()        => setConnected(false))
    socket.on('history',    (msgs: LiveChatMessage[]) => setMessages(msgs))
    socket.on('message',    (msg: LiveChatMessage)    => {
      liveIds.current.add(msg.id)
      setMessages(prev => [...prev, msg])
    })
    socket.on('error',      (msg: string)             => setError(msg))

    socket.emit('join', matchId)

    return () => {
      socket.emit('leave', matchId)
      socket.disconnect()
      socketRef.current = null
      setMessages([])
      setConnected(false)
      liveIds.current = new Set()
    }
  }, [matchId, enabled])

  const send = useCallback((content: string, opts?: {
    replyToId?:          string
    attachmentUrl?:      string
    attachmentType?:     ChatAttachmentType
    attachmentDuration?: number
  }) => {
    setError(null)
    socketRef.current?.emit('send', { matchId, content, ...opts })
  }, [matchId])

  return { messages, connected, error, send, liveIds: liveIds.current }
}
