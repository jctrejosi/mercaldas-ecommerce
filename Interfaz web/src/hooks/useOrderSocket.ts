import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useOrderSocket(orderId: string | null) {
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const socket = io(`${SOCKET_URL}/orders`, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe:order', orderId);
    });

    socket.on('order:status', (data: { orderId: string; status: string }) => {
      setOrderStatus(data.status);
    });

    return () => {
      socket.emit('unsubscribe:order', orderId);
      socket.disconnect();
    };
  }, [orderId]);

  return orderStatus;
}
