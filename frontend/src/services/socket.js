import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_URL || 'https://crm-platform-2.onrender.com/api'
let socket = null

export function initSocket(token, userId) {
  if (socket) return socket
  socket = io(URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true
  })

  socket.on('connect', () => {
    if (userId) socket.emit('joinRoom', `user:${userId}`)
    console.log('socket connected', socket.id)
  })

  socket.on('disconnect', () => console.log('socket disconnected'))
  return socket
}

export function getSocket() { return socket }
export function disconnectSocket() { if (socket) socket.disconnect(); socket = null }
