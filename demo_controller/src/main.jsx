import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LogicGatesController from './logic_gates_controller/logic_gates_controller.jsx'  

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LogicGatesController />
  </StrictMode>,
)
