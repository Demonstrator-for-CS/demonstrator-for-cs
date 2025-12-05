import React from "react";
import Demo from "@/components/Demo.jsx";

export default function SearchingSorting() {
    const slideModules = import.meta.glob('./Slides/*.jsx', { eager: true });

    const slides = Object.entries(slideModules)
        .map(([path, module]) => {
            const fileName = path.split('/').pop().replace('.jsx', '');
            const orderMatch = fileName.match(/^\d+/);
            const order = orderMatch ? Number(orderMatch[0]) : 0;
            return {
                id: fileName,
                order,
                component: module.default,
            };
        })
        .sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));

    return <Demo slides={slides} slideDuration={10000} />;
}