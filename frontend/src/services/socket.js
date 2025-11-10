// src/socket.js
import { io } from 'socket.io-client';

const URL = (import.meta.env.VITE_API_URL || 'https://crm-platform-2.onrender.com').replace(/\/+$/, '');
let socket = null;

export function initSocket(token, userId) {
  if (socket) return socket;

  socket = io(URL, {
    // if you use cookies for auth, browser will send them automatically when allowed by SameSite/Secure rules
    // you can also pass token in auth payload (recommended if not using cookies)
    auth: token ? { token } : undefined,
    transports: ['websocket'],
    autoConnect: true
  });

  socket.on('connect', () => {
    if (userId) socket.emit('joinRoom', `user:${userId}`);
    console.log('socket connected', socket.id);
  });

  socket.on('disconnect', () => console.log('socket disconnected'));
  socket.on('connect_error', (err) => console.error('socket connect_error', err));

  return socket;
}

export function getSocket() { return socket; }
export function disconnectSocket() { if (socket) { socket.disconnect(); socket = null; } }
