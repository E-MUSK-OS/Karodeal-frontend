import { io } from 'socket.io-client';
import { useEffect } from 'react';

let socket = null;
let socketDisabled = false;

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
  return rawUrl.replace(/\/api\/?$/, '');
};

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  const socketUrl = getSocketUrl();

  // Vercel Serverless hosting does not support long-lived WebSockets.
  // If backend is on vercel.app and no dedicated NEXT_PUBLIC_SOCKET_URL is specified, skip socket connection
  // to prevent 404 console errors.
  if (!process.env.NEXT_PUBLIC_SOCKET_URL && socketUrl.includes('vercel.app')) {
    return null;
  }

  if (socketDisabled) return null;

  if (!socket) {
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      autoConnect: true,
      timeout: 5000
    });

    socket.on('connect', () => {
      // Connected
    });

    socket.on('connect_error', (err) => {
      // If serverless responds with 404 or fails, stop aggressive retries
      if (err?.message?.includes('404') || err?.description === 404) {
        socketDisabled = true;
        try {
          socket.disconnect();
        } catch (e) {}
      }
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
