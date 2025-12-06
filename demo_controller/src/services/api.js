/**
 * API Service for Demo Controller
 *
 * This module handles all communication between the demo-controller (phone app)
 * and the Flask server using Socket.IO WebSockets. It provides a clean API for
 * sending controller commands that are relayed to the demo-site.
 *
 * Communication Flow:
 *     controller (phone) -> WebSocket -> server -> WebSocket -> demo-site (display)
 *
 * The socket connection is initialized once when the app loads and persists
 * throughout the session, automatically reconnecting if the connection is lost.
 */
import { io } from "socket.io-client";

// Server URL - hosted on Render.com
const API_BASE_URL = 'https://pitt-cs-demo-server.onrender.com';
//const API_BASE_URL = 'http://localhost:5000'; // Use for local development

// ----------------------------------------------------------------------
// 1. Connection Initialization
// ----------------------------------------------------------------------

// Global socket instance (singleton pattern)
let socket = null;

/**
 * Initialize the WebSocket connection to the server.
 *
 * This should be called once when the app loads. The socket connection persists
 * across route changes and automatically reconnects if disconnected.
 *
 * @param {function} onConnect - Callback invoked when socket connects, receives socket ID
 * @param {function} onDisconnect - Callback invoked when socket disconnects, receives reason
 * @returns {Socket} The Socket.IO socket instance
 *
 * @example
 * initializeSocket(
 *     (id) => console.log('Connected with ID:', id),
 *     (reason) => console.log('Disconnected:', reason)
 * );
 */
export const initializeSocket = (onConnect, onDisconnect) => {
    // Return existing socket if already initialized (singleton)
    if (socket) return socket;

    // Create new socket connection with automatic reconnection
    socket = io(API_BASE_URL, {
        reconnection: true,              // Enable automatic reconnection
        reconnectionAttempts: Infinity,  // Never stop trying to reconnect
    });

    // Handle successful connection
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        // Identify this client as the controller
        socket.emit('identify', { role: 'controller' });
        if (onConnect) onConnect(socket.id);
    });

    // Handle disconnection (user closes app, network issue, server restart, etc.)
    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        if (onDisconnect) onDisconnect(reason);
    });

    // Handle messages from server (for debugging and notifications)
    socket.on('server_message', (data) => {
        console.log('Server message:', data);
    });

    return socket;
};

/**
 * Subscribe to a specific WebSocket event.
 *
 * Allows components to listen for custom events from the server. The returned
 * cleanup function should be called when the component unmounts to prevent
 * memory leaks.
 *
 * @param {string} eventName - The name of the socket event (e.g., 'state_update')
 * @param {function} callback - Function called when the event is received
 * @returns {function} Cleanup function to remove the listener
 *
 * @example
 * // In a React component
 * useEffect(() => {
 *     const unsubscribe = subscribeToSocketEvent('state_update', (state) => {
 *         console.log('New state:', state);
 *     });
 *     return unsubscribe; // Cleanup on unmount
 * }, []);
 */
export const subscribeToSocketEvent = (eventName, callback) => {
    if (!socket) {
        console.error('Socket not initialized. Cannot subscribe.');
        return () => {};
    }

    // Attach the event listener
    socket.on(eventName, callback);

    // Return an unsubscribe function for cleanup
    return () => {
        socket.off(eventName, callback);
        console.log(`Unsubscribed from ${eventName}`);
    };
};

// ----------------------------------------------------------------------
// 2. Data Transmission
// ----------------------------------------------------------------------

/**
 * Send a controller input command to the server.
 *
 * This is the low-level function used by all command wrappers below.
 * All controller actions are sent through the 'controller_input' event
 * with a unified format.
 *
 * @param {string} action - The action type (e.g., 'navigate', 'set_demo')
 * @param {object} payload - Action-specific data
 *
 * @example
 * sendControllerInput('navigate', { direction: 'next' });
 */
export const sendControllerInput = (action, payload = {}) => {
    if (!socket || !socket.connected) {
        console.error(`Cannot send action "${action}": Socket not connected.`);
        return;
    }

    // Emit unified controller_input event to server
    socket.emit('controller_input', {
        action,
        payload,
        timestamp: Date.now(),  // For deduplication on the server/demo-site
    });
};

// ----------------------------------------------------------------------
// 3. Command Wrappers - High-level API for controller actions
// ----------------------------------------------------------------------

/**
 * Navigate between slides (next/prev) or select a demo.
 *
 * @param {string} direction - 'next', 'prev', or 'select'
 * @param {object} extraPayload - Additional data (e.g., demoPath for 'select')
 *
 * @example
 * navigate('next');  // Go to next slide
 * navigate('prev');  // Go to previous slide
 * navigate('select', { demoPath: '/logic-gates' });  // Select a demo
 */
export const navigate = (direction, extraPayload = {}) => {
    sendControllerInput('navigate', { direction, ...extraPayload });
};

/**
 * Resume/play the current demo animation.
 */
export const play = () => {
    sendControllerInput('play');
};

/**
 * Pause the current demo animation.
 */
export const pause = () => {
    sendControllerInput('pause');
};

/**
 * Reset the current demo animation to its initial state.
 */
export const reset = () => {
    sendControllerInput('reset_animation');
};

/**
 * Start the sorting visualization in the Searching & Sorting demo.
 */
export const startSorting = () => {
    sendControllerInput('start_sorting');
}

/**
 * Switch to a different demo.
 *
 * The server uses this to manage Socket.IO rooms for targeted messaging.
 *
 * @param {string} demo - Demo identifier (e.g., 'logic-gates', 'searching-sorting')
 *
 * @example
 * setDemo('logic-gates');  // Switch to Logic Gates demo
 */
export const setDemo = (demo) => {
    sendControllerInput('set_demo', { demo });
};

/**
 * Send logic gate input values (A and B toggles) to the demo-site.
 *
 * @param {object} input - Object with inputA and inputB boolean values
 *
 * @example
 * sendLogicGatesInput({ inputA: true, inputB: false });
 */
export const sendLogicGatesInput = (input) => {
    sendControllerInput('logic_gates_input', input);
};

/**
 * Return to the home screen.
 *
 * This sends a command to the server AND navigates the controller itself
 * back to the home page.
 */
export const navigateHome = () => {
    sendControllerInput('navigate_to_home');
    // Also navigate the controller itself to home
    window.location.href = '/';
};