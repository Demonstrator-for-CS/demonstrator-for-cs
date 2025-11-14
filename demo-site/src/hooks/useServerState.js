import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const BACKEND = 'http://localhost:5000';

let socket = null;

export function useServerState() {
  const [state, setState] = useState({
    status: 'idle',
    current_demo: null,
    current_slide: 0,
    speed: 1.0,
    controller_input: {},
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(BACKEND, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Connected to Flask server');
        setIsConnected(true);
        // Request current state
        socket.emit('request_state');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from Flask server');
        setIsConnected(false);
      });

      socket.on('state_update', (newState) => {
        console.log('State update received:', newState);
        setState(newState);
      });
    }

    return () => {
    };
  }, []);

  return { state, isConnected };
}