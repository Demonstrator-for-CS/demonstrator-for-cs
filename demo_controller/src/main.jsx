import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route} from "react-router";
import './index.css'
import HomePage from './pages/HomePage.jsx'

createRoot(document.getElementById('root')).render(

    <BrowserRouter>
        {/*  Wondering how to add routes? Visit https://reactrouter.com/start/declarative/routing  */}
        <Routes>
            <Route path="/" element={<HomePage />} />
        </Routes>
    </BrowserRouter>,
)
