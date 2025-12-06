/**
 * Demo Controller Main Entry Point
 *
 * This is the remote controller application that users access from their phones
 * via the QR code displayed on the demo-site. It establishes a WebSocket connection
 * to the Flask server and provides controls for navigating demos and adjusting settings.
 *
 * Architecture:
 *     - This app is hosted on GitHub Pages at https://demonstrator-for-cs.github.io/
 *     - Users scan a QR code to access this controller from their phones
 *     - The controller communicates with the server via WebSocket
 *     - The server relays commands to the demo-site (display behind glass)
 *
 * Routes:
 *     / - Home page with demo selection
 *     /logic-gates - Controller for the Logic Gates demo
 *     /searching-sorting - Controller for the Searching & Sorting demo
 */

import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import './index.css'
import HomePage from './home_page_controller/home_page_controller.jsx'
import LogicGatesController from './logic_gates_controller/logic_gates_controller.jsx'
import TreeController from './complexity_controller/tree_controller.jsx'
import { initializeSocket } from './services/api.js';

/**
 * AppWrapper Component
 *
 * Manages the global WebSocket connection and routing for the controller app.
 * This component initializes the socket connection when the app mounts and
 * displays a connection status indicator in the bottom-right corner.
 *
 * The socket connection is maintained throughout the entire session, allowing
 * seamless communication with the server as users navigate between controllers.
 */
// eslint-disable-next-line react-refresh/only-export-components
function AppWrapper() {
    const [socketStatus, setSocketStatus] = useState('connecting');
    const [socketId, setSocketId] = useState(null);

    useEffect(() => {
        // Initialize the socket when the app mounts
        // The socket persists across route changes
        initializeSocket(
            (id) => {
                setSocketId(id);
                setSocketStatus('connected');
            },
            (reason) => {
                setSocketId(null);
                setSocketStatus(`disconnected: ${reason}`);
            }
        );

        // Cleanup is handled by the socket.io-client library when page closes
    }, []);

    // Log connection status for debugging
    console.log(`Socket Status: ${socketStatus} (ID: ${socketId})`);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/logic-gates" element={<LogicGatesController />} />
                <Route path="/searching-sorting" element={<TreeController />} />
            </Routes>
            {/* Connection status indicator in bottom-right corner */}
            <div className={`fixed bottom-0 right-0 p-2 text-xs font-mono rounded-tl-lg
                             ${socketStatus.startsWith('connected') ? 'bg-green-500' : 'bg-red-500'}
                             text-white transition-colors duration-300`}>
                {socketStatus.startsWith('connected') ? `Live (${socketId.substring(0, 4)}...)` : socketStatus}
            </div>
        </BrowserRouter>
    );
}

// Render the app to the DOM
createRoot(document.getElementById('root')).render(
    <AppWrapper />
);