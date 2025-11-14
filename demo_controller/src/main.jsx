import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route} from "react-router";
import './index.css'
import HomePage from './home_page_controller/home_page_controller.jsx'
import LogicGates from './logic_gates_controller/logic_gates_controller.jsx'
import MergeSort from './complexity_controller/merge_sort_controller.jsx'
import BubbleSort from './complexity_controller/bubble_sort_controller.jsx'
import Tree from './complexity_controller/tree_controller.jsx'

createRoot(document.getElementById('root')).render(

    <BrowserRouter>
        {/*  Wondering how to add routes? Visit https://reactrouter.com/start/declarative/routing  */}
        <Routes>
            <Route path="/" element={<BubbleSort />} />
        </Routes>
    </BrowserRouter>,
)
