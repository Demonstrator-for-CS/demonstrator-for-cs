import React from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router";
import App from "@/App.jsx";
import LogicGates from "@/pages/Demo1_Logic_Gates/Logic_Gates_Main.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/logic-gates" element={<LogicGates />} />
        </Routes>
    </BrowserRouter>,
);

