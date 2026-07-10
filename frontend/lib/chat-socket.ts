import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

/**
 * Lazy singleton for the /chat namespace. Cookies ride along
 * (withCredentials), so a logged-in reader can post immediately.
 */
export function getChatSocket(): Socket {
  if (!socket) {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
    const origin = new URL(api).origin
    socket = io(`${origin}/chat`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}
