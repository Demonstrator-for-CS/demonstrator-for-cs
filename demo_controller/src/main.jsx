import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route} from "react-router";
import './index.css'
import HomePage from './home_page_controller/home_page_controller.jsx'
import LogicGatesController from './logic_gates_controller/logic_gates_controller.jsx'
import TreeController from './complexity_controller/tree_controller.jsx'

createRoot(document.getElementById('root')).render(

    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/logic-gates" element={<LogicGatesController />} />
            <Route path="/searching-sorting" element={<TreeController />} />
        </Routes>
    </BrowserRouter>,
)
