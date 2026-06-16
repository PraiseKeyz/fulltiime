'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export interface LiveChatMessage {
  id:         string
  content:    string
  created_at: string
  user: {
    id:         string
    username:   string
    avatar_url: string | null
  }
}

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export function useLiveChat(matchId: string, enabled = true) {
  const socketRef                                          = useRef<Socket | null>(null)
  const [messages, setMessages]                           = useState<LiveChatMessage[]>([])
  const [connected, setConnected]                         = useState(false)
  const [error, setError]                                 = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !matchId) return

    const socket = io(`${WS_URL}/live-chat`, {
      withCredentials: true,  // send the access_token cookie
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect',    ()        => setConnected(true))
    socket.on('disconnect', ()        => setConnected(false))
    socket.on('history',    (msgs: LiveChatMessage[]) => setMessages(msgs))
    socket.on('message',    (msg: LiveChatMessage)    => setMessages(prev => [...prev, msg]))
    socket.on('error',      (msg: string)             => setError(msg))

    socket.emit('join', matchId)

    return () => {
      socket.emit('leave', matchId)
      socket.disconnect()
      socketRef.current = null
      setMessages([])
      setConnected(false)
    }
  }, [matchId, enabled])

  const send = useCallback((content: string) => {
    setError(null)
    socketRef.current?.emit('send', { matchId, content })
  }, [matchId])

  return { messages, connected, error, send }
}
