import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react'; // Import hooks
import './index.css'
import HomePage from './home_page_controller/home_page_controller.jsx'
import LogicGatesController from './logic_gates_controller/logic_gates_controller.jsx'
import TreeController from './complexity_controller/tree_controller.jsx'
import { initializeSocket } from './services/api.js'; // Import the new initializer

// This wrapper component handles the global socket state and initialization
// eslint-disable-next-line react-refresh/only-export-components
function AppWrapper() {
    const [socketStatus, setSocketStatus] = useState('connecting');
    const [socketId, setSocketId] = useState(null);

    useEffect(() => {
        // Initialize the socket when the app mounts
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

        // Cleanup is handled by the socket.io-client library internally when the page closes/unloads
    }, []);

    // You can optionally pass the status/ID down as props or context
    // For now, we'll just log it.
    console.log(`Socket Status: ${socketStatus} (ID: ${socketId})`);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/logic-gates" element={<LogicGatesController />} />
                <Route path="/searching-sorting" element={<TreeController />} />
            </Routes>
            <div className={`fixed bottom-0 right-0 p-2 text-xs font-mono rounded-tl-lg 
                             ${socketStatus.startsWith('connected') ? 'bg-green-500' : 'bg-red-500'} 
                             text-white transition-colors duration-300`}>
                {socketStatus.startsWith('connected') ? `Live (${socketId.substring(0, 4)}...)` : socketStatus}
            </div>
        </BrowserRouter>
    );
}


createRoot(document.getElementById('root')).render(
    <AppWrapper />
);