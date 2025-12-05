import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import QRCode from "react-qr-code";
import { demoCatalog } from "@/data/demoCatalog.js";
import { useServerState } from "@/hooks/useServerState.js";

export default function HomePage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const offsetsRef = useRef(new Map());
    const lastProcessedTimestamp = useRef(null);
    const { state } = useServerState();

    const hasMultiple = demoCatalog.length > 1;

    function cycle(direction) {
        if (!hasMultiple) return;
        const len = demoCatalog.length;
        setActiveIndex((current) =>
            direction === "next"
                ? (current + 1) % len
                : (current - 1 + len) % len,
        );
    }

    // Handle controller input from server
    useEffect(() => {
        if (!state.controller_input || !state.controller_input.action) return;

        const { action, payload, timestamp } = state.controller_input;

        // Only process new inputs (avoid re-processing on activeIndex change)
        if (timestamp && timestamp === lastProcessedTimestamp.current) return;
        lastProcessedTimestamp.current = timestamp;

        if (action === 'navigate' && payload?.direction) {
            const { direction } = payload;

            if (direction === 'prev') {
                cycle('prev');
            } else if (direction === 'next') {
                cycle('next');
            } else if (direction === 'select') {
                if (payload.demoPath) {
                    navigate(payload.demoPath);
                } else {
                    const activeDemo = demoCatalog[activeIndex];
                    if (activeDemo && activeDemo.status === 'available') {
                        const target = activeDemo.path || `/demos/${activeDemo.id}`;
                        navigate(target);
                    }
                }
            }
        }
    }, [state.controller_input, activeIndex, navigate, cycle]);

    const carouselCards = useMemo(() => {
        const total = demoCatalog.length;
        if (total === 0) return [];

        const previousOffsets = offsetsRef.current;
        const nextOffsets = new Map();

        const cards = demoCatalog.map((demo, index) => {
            const offset = resolveOffset(index, activeIndex, total, previousOffsets);
            nextOffsets.set(index, offset);
            return { demo, index, offset };
        });

        offsetsRef.current = nextOffsets;
        return cards;
    }, [activeIndex]);


    function launchDemo(demo) {
        if (!demo || demo.status !== "available") return;
        const target = demo.path || `/demos/${demo.id}`;
        navigate(target);
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") cycle("next");
            if (e.key === "ArrowLeft") cycle("prev");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [hasMultiple]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-black flex flex-col items-center justify-center">
            {/* QR Code in bottom left corner */}
            <div className="absolute bottom-8 left-8 bg-white p-6 rounded-lg shadow-lg z-50">
                <QRCode
                    value="https://demonstrator-for-cs.github.io/"
                    size={200}
                    level="M"
                />
                <p className="text-2xl text-center mt-3 text-gray-600 font-medium">Scan to interact</p>
            </div>

            <div className="flex flex-col items-center justify-center w-full pt-12 pb-8">
                <h1 className="text-center text-9xl font-bold mb-6 text-blue-600">CS Demonstrator</h1>
            </div>

            <div className="relative w-full max-w-5xl h-[20rem] overflow-visible flex items-center justify-center">
                {carouselCards.map(({ demo, index, offset }) => (
                    <CarouselCard
                        key={demo.id}
                        demo={demo}
                        offset={offset}
                        isActive={index === activeIndex}
                        onSelect={() => setActiveIndex(index)}
                        onActivate={() => launchDemo(demo)}
                    />
                ))}
            </div>

        </div>
    );
}

function resolveOffset(index, activeIndex, length, previousOffsets) {
    const raw = index - activeIndex;
    const normalized = normalizeOffset(raw, length);

    const previous = previousOffsets.get(index);
    if (previous === undefined) return normalized;

    let best = normalized;
    let minDiff = Math.abs(normalized - previous);

    for (let k = -2; k <= 2; k += 1) {
        const candidate = normalizeOffset(raw + k * length, length);
        const diff = Math.abs(candidate - previous);
        if (diff < minDiff) {
            minDiff = diff;
            best = candidate;
        }
    }

    return best;
}

function normalizeOffset(value, length) {
    let offset = value;
    const half = length / 2;
    while (offset > half) offset -= length;
    while (offset < -half) offset += length;
    return offset;
}

function CarouselCard({ demo, offset, isActive, onSelect, onActivate }) {
    const zIndex = isActive ? 10 : 1;

    return (
        <button
            type="button"
            onClick={() => {
                if (isActive) {
                    onActivate?.();
                } else {
                    onSelect();
                }
            }}
            className={`absolute bg-white border-4 border-black rounded-lg 
                        w-[28rem] h-[14rem] flex items-center justify-center 
                        transition-transform duration-500 ease-out cursor-pointer`}
            style={{
                transform: `translateX(${offset * 32}rem)`,
                zIndex,
            }}
        >
            <h2 className="text-5xl font-bold text-black">{demo.title}</h2>
        </button>
    );
}