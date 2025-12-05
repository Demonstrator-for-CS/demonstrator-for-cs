// API service for communicating with Flask server using Socket.IO
import { io } from "socket.io-client";

const API_BASE_URL = 'https://pitt-cs-demo-server.onrender.com';
//const API_BASE_URL = 'http://localhost:5000'; // Use for local development

// ----------------------------------------------------------------------
// 1. Connection Initialization
// ----------------------------------------------------------------------

let socket = null;

export const initializeSocket = (onConnect, onDisconnect) => {
    if (socket) return socket;

    socket = io(API_BASE_URL, {
        reconnection: true,
        reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        if (onConnect) onConnect(socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        if (onDisconnect) onDisconnect(reason);
    });

    socket.on('server_message', (data) => {
        console.log('Server message:', data);
    });

    return socket;
};

/**
 * Allows a component to listen for a specific socket event.
 * @param {string} eventName - The name of the socket event (e.g., 'animation_state').
 * @param {function} callback - The function to call when the event is received.
 * @returns {function} Cleanup function to remove the listener.
 */
export const subscribeToSocketEvent = (eventName, callback) => {
    if (!socket) {
        console.error('Socket not initialized. Cannot subscribe.');
        return () => {};
    }

    // Attach the listener
    socket.on(eventName, callback);

    // Return an unsubscribe function
    return () => {
        socket.off(eventName, callback);
        console.log(`Unsubscribed from ${eventName}`);
    };
};

// ----------------------------------------------------------------------
// 2. Data Transmission
// ----------------------------------------------------------------------

export const sendControllerInput = (action, payload = {}) => {
    if (!socket || !socket.connected) {
        console.error(`Cannot send action "${action}": Socket not connected.`);
        return;
    }

    // Use a single, unified event 'controller_input' to send all commands
    socket.emit('controller_input', {
        action,
        payload,
        timestamp: Date.now(),
    });
};

// ----------------------------------------------------------------------
// 3. Command Wrappers (Updated setDemo to manage rooms on the server)
// ----------------------------------------------------------------------

export const navigate = (direction, extraPayload = {}) => {
    sendControllerInput('navigate', { direction, ...extraPayload });
};

export const play = () => {
    sendControllerInput('play');
};

export const pause = () => {
    sendControllerInput('pause');
};

export const reset = () => {
    sendControllerInput('reset_animation');
};

export const startSorting = () => {
    sendControllerInput('start_sorting');
}

// IMPORTANT: When the demo changes, we send the new demo name.
// The server should use this to automatically manage the Socket.IO room.
export const setDemo = (demo) => {
    sendControllerInput('set_demo', { demo });
};

export const sendLogicGatesInput = (input) => {
    sendControllerInput('logic_gates_input', input);
};

export const navigateHome = () => {
    sendControllerInput('navigate_to_home');
    // Also navigate the controller itself to home
    window.location.href = '/';
};