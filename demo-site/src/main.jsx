import React from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router";
import HomePage from "@/pages/HomePage.jsx";
import LogicGates from "@/pages/Demo1_Logic_Gates.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/logic-gates" element={<LogicGates />} />
        </Routes>
    </BrowserRouter>,
);

