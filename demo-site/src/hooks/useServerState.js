import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const BACKEND = 'https://pitt-cs-demo-server.onrender.com';

let socket = null;
let sharedState = {
  status: 'idle',
  current_demo: null,
  current_slide: 0,
  speed: 1.0,
  controller_input: {},
};
let sharedIsConnected = false;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function useServerState() {
  const [state, setState] = useState(sharedState);
  const [isConnected, setIsConnected] = useState(sharedIsConnected);

  useEffect(() => {
    // Register this component as a listener
    const updateState = () => {
      setState({ ...sharedState });
      setIsConnected(sharedIsConnected);
    };

    listeners.add(updateState);

    // Initialize socket if not already done
    if (!socket) {
      socket = io(BACKEND, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        sharedIsConnected = true;
        notifyListeners();
        // Request current state
        socket.emit('request_state');
      });

      socket.on('disconnect', () => {
        sharedIsConnected = false;
        notifyListeners();
      });

      socket.on('state_update', (newState) => {
        // Update shared state and notify all listeners
        sharedState = {
          ...newState,
          controller_input: newState.controller_input ? { ...newState.controller_input } : {}
        };
        notifyListeners();
      });
    }

    return () => {
      listeners.delete(updateState);
    };
  }, []);

  return { state, isConnected, socket };
}
