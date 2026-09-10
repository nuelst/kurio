import { io, type Socket } from 'socket.io-client'

import { sessionStore } from '@/shared/stores/session-store'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (socket) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL ?? '/', {
    autoConnect: true,
    transports: ['websocket'],
    auth: () => ({ token: sessionStore.getState().accessToken }),
  })

  return socket
}

export function resetSocket(): void {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}
