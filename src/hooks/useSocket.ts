import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (projectId?: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io();

    if (projectId) {
      socketRef.current.emit('join-project', projectId);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [projectId]);

  return socketRef.current;
};
