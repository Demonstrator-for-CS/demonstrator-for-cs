/**
 * useServerState Hook
 *
 * This React hook connects the demo-site to the Flask server via WebSocket
 * and provides access to the shared demo state. It implements a singleton
 * socket connection that is shared across all components using this hook.
 *
 * The hook listens for 'state_update' events from the server and notifies
 * all subscribed components when the state changes. This ensures that all
 * demos stay synchronized with controller inputs.
 *
 * Usage:
 *     const { state, isConnected, socket, command, consumeCommand } = useServerState();
 *
 * Returned state object contains:
 *     - status: Current status ('idle', 'playing', 'paused', etc.)
 *     - current_demo: Active demo identifier ('logic-gates', 'searching-sorting', null)
 *     - current_slide: Current slide index
 *     - speed: Animation speed multiplier
 *     - controller_input: Latest controller input data (e.g., logic gate values)
 */
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Server URL - hosted on Render.com
const BACKEND = 'https://pitt-cs-demo-server.onrender.com';
//const BACKEND = 'http://localhost:5000';  // Use for local development

// Singleton socket instance shared across all components
let socket = null;

// Shared state synchronized from the server
let sharedState = {
  status: 'idle',
  current_demo: null,
  current_slide: 0,
  speed: 1.0,
  controller_input: {},
};
let sharedCommand = null;
let sharedIsConnected = false;

// Set of listener functions to notify when state changes
const listeners = new Set();

/**
 * Notify all registered listeners of a state change.
 * This is called whenever the shared state is updated from the server.
 */
export function notifyListeners() {
  listeners.forEach(listener => listener());
}

/**
 * Custom React hook to access the shared server state.
 *
 * Creates a WebSocket connection to the server (on first use) and subscribes
 * to state updates. Multiple components can use this hook simultaneously, and
 * they will all receive updates when the server broadcasts new state.
 *
 * @returns {object} Object containing:
 *     - state: Current demo state from server
 *     - isConnected: Boolean indicating WebSocket connection status
 *     - socket: The Socket.IO socket instance (for custom events)
 *     - command: Latest command from server (if any)
 *     - consumeCommand: Function to mark command as processed
 */
export function useServerState() {
  const [state, setState] = useState(sharedState);
  const [isConnected, setIsConnected] = useState(sharedIsConnected);
  const [command, setCommand] = useState(sharedCommand);

  useEffect(() => {
    // Register this component as a listener for state updates
    const updateState = () => {
      setState({ ...sharedState });
      setIsConnected(sharedIsConnected);
      setCommand(sharedCommand);
    };

    listeners.add(updateState);

    // Initialize socket on first use (singleton pattern)
    if (!socket) {
      socket = io(BACKEND, {
        transports: ['websocket', 'polling'],  // Try WebSocket first, fallback to polling
      });

      // Handle successful connection
      socket.on('connect', () => {
        sharedIsConnected = true;
        notifyListeners();
        // Identify this client as the demo-site
        socket.emit('identify', { role: 'demo-site' });
        // Request current state from server
        socket.emit('request_state');
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        sharedIsConnected = false;
        notifyListeners();
      });

      // Handle state updates from server (sent on controller input)
      socket.on('state_update', (newState) => {
        if (newState.command) {
            sharedCommand = { name: newState.command, id: Math.random() };
        }

        // Update shared state and notify all listeners
        const {  ...restOfState } = newState;
        sharedState = {
          ...restOfState,
          controller_input: newState.controller_input ? { ...newState.controller_input } : {}
        };
        notifyListeners();
      });
    }

    // Cleanup: remove this component's listener when it unmounts
    return () => {
      listeners.delete(updateState);
    };
  }, []);

  /**
   * Mark the current command as consumed/processed.
   * This prevents the same command from being processed multiple times.
   */
  const consumeCommand = () => {
    if (sharedCommand) {
        sharedCommand = null;
        notifyListeners();
    }
  }

  return { state, isConnected, socket, command, consumeCommand };
}
