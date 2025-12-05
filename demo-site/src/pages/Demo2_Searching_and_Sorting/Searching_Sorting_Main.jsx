import React from "react";
import Demo from "@/components/Demo.jsx";

export default function SearchingSorting() {
    const slideModules = import.meta.glob('./Slides/*.jsx', { eager: true });

    const desiredOrder = [
        '1-Intro',
        '2-Trees',
        '3.0-BFS',
        '3.1-BFS',
        '3.2-BFS',
        '3.3-BFS',
        '3.4-BFS',
        '3.5-BFS',
        '3.6-BFS',
        '3.7-BFS',
        '3.8-Complexity',
        '4.0-DFS',
        '4.1-DFS',
        '4.2-DFS',
        '4.3-DFS',
        '4.4-DFS',
        '4.5-DFS',
        '4.6-DFS',
        '4.7-DFS',
        '4.8-Complexity',
        '5-MinHeap',
        '6-MinElement',
        '7-MaxHeap',
        '8-MaxElement',
        '10-BubbleSortIntro',
        '11-BubbleSortPasses',
        '12-BubbleSortDemo',
        '13-BubbleSortComplexity',
        '14-SelectionSortIntro',
        '15-SelectionSortDemo',
        '16-SelectionSortComplexity',
    ];

    const weight = (id) => {
        const idx = desiredOrder.indexOf(id);
        return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    const slides = Object.entries(slideModules)
        .map(([path, module]) => {
            const fileName = path.split('/').pop().replace('.jsx', '');
            return {
                id: fileName,
                order: weight(fileName),
                component: module.default,
            };
        })
        .sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));

    return <Demo slides={slides} slideDuration={10000} />;
}
