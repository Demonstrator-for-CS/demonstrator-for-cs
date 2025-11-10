import React from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router";
import App from "@/App.jsx";
import HomePage from "@/pages/HomePage.jsx"
import LogicGates from "@/pages/Demo1_Logic_Gates/Logic_Gates_Main.jsx";
import SearchingSorting from "@/pages/Demo2_Searching_and_Sorting/Searching_Sorting_Main.jsx"

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/logic-gates" element={<LogicGates />} />
            <Route path="/searching-sorting" element={<SearchingSorting />} />
        </Routes>
    </BrowserRouter>,
);

