import React from "react";
import Demo from "@/components/Demo.jsx";

export default function LogicGates() {
    // Dynamically import all slide files
    const slideModules = import.meta.glob('./Slides/*.jsx', { eager: true });

    // Convert to slides array and sort by filename
    const slides = Object.entries(slideModules)
        .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
        .map(([path, module], index) => {
            const fileName = path.split('/').pop().replace('.jsx', '');
            return {
                id: fileName,
                component: module.default
            };
        });

    return <Demo slides={slides} slideDuration={10000} />;
}