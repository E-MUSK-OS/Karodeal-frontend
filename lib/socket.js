import { io } from 'socket.io-client';
import { useEffect } from 'react';

let socket = null;

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return rawUrl.replace(/\/api\/?$/, '');
};

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const socketUrl = getSocketUrl();

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
      autoConnect: true,
    });

    socket.on('connect', () => {
      // console.log('[Socket.io] Connected to server ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      // console.warn('[Socket.io] Connection warning:', err.message);
    });
  }

  return socket;
};

export const useSocketEvent = (event, callback) => {
  useEffect(() => {
    const s = getSocket();
    if (!s || !callback) return;

    s.on(event, callback);
    return () => {
      s.off(event, callback);
    };
  }, [event, callback]);
};
