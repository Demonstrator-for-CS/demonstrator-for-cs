import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const BACKEND = 'https://pitt-cs-demo-server.onrender.com';
//const BACKEND = 'http://localhost:5000';


let socket = null;
let sharedState = {
  status: 'idle',
  current_demo: null,
  current_slide: 0,
  speed: 1.0,
  controller_input: {},
};
let sharedCommand = null;
let sharedIsConnected = false;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function useServerState() {
  const [state, setState] = useState(sharedState);
  const [isConnected, setIsConnected] = useState(sharedIsConnected);
  const [command, setCommand] = useState(sharedCommand);

  useEffect(() => {
    // Register this component as a listener
    const updateState = () => {
      setState({ ...sharedState });
      setIsConnected(sharedIsConnected);
      setCommand(sharedCommand);
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
        if (newState.command) {
            sharedCommand = { name: newState.command, id: Math.random() };
        }

        // Update shared state and notify all listeners
        const { command, ...restOfState } = newState;
        sharedState = {
          ...restOfState,
          controller_input: newState.controller_input ? { ...newState.controller_input } : {}
        };
        notifyListeners();
      });
    }

    return () => {
      listeners.delete(updateState);
    };
  }, []);

  const consumeCommand = () => {
    if (sharedCommand) {
        sharedCommand = null;
        notifyListeners();
    }
  }

  return { state, isConnected, socket, command, consumeCommand };
}
