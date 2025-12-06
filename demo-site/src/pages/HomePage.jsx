/**
 * Demo-Site Home Page Component
 *
 * This is the main landing page displayed on the demo-site (behind glass).
 * It shows a carousel of available demos and a QR code for users to scan
 * and access the remote controller from their phones.
 *
 * The carousel is synchronized with the remote controller - when users press
 * left/right arrows on their phone, this carousel animates in sync. When they
 * select a demo, this page navigates to the corresponding demo view.
 *
 * Features:
 *     - Animated 3D carousel of demo cards
 *     - QR code in bottom-left corner linking to the controller
 *     - Real-time synchronization with controller via WebSocket
 *     - Smooth animations with wraparound navigation
 *     - Keyboard navigation support (arrow keys)
 *
 * Controller Integration:
 *     - Listens for 'navigate' actions from the controller
 *     - Cycles through demos when 'next'/'prev' is received
 *     - Launches demo when 'select' is received
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import QRCode from "react-qr-code";
import { demoCatalog } from "@/data/demoCatalog.js";
import { useServerState } from "@/hooks/useServerState.js";

export default function HomePage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const offsetsRef = useRef(new Map());  // Track carousel positions for smooth animation
    const lastProcessedTimestamp = useRef(null);  // Prevent duplicate event processing
    const { state } = useServerState();

    const hasMultiple = demoCatalog.length > 1;

    /**
     * Cycle through the demo carousel.
     *
     * @param {string} direction - 'next' or 'prev'
     */
    function cycle(direction) {
        if (!hasMultiple) return;
        const len = demoCatalog.length;
        setActiveIndex((current) =>
            direction === "next"
                ? (current + 1) % len
                : (current - 1 + len) % len,
        );
    }

    /**
     * Handle controller input from server.
     *
     * This effect listens for navigation commands from the remote controller
     * and updates the carousel accordingly. It uses timestamp-based deduplication
     * to prevent processing the same command multiple times.
     */
    useEffect(() => {
        if (!state.controller_input || !state.controller_input.action) return;

        const { action, payload, timestamp } = state.controller_input;

        // Only process new inputs (avoid re-processing on activeIndex change)
        if (timestamp && timestamp === lastProcessedTimestamp.current) return;
        lastProcessedTimestamp.current = timestamp;

        // Handle navigation actions from controller
        if (action === 'navigate' && payload?.direction) {
            const { direction } = payload;

            if (direction === 'prev') {
                cycle('prev');  // Move carousel backwards
            } else if (direction === 'next') {
                cycle('next');  // Move carousel forwards
            } else if (direction === 'select') {
                // Launch the selected demo
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

    /**
     * Generate carousel card positions with smooth wraparound animation.
     *
     * This memo calculates the horizontal offset for each demo card to create
     * a 3D carousel effect. It uses the previous offsets to determine the best
     * animation path when wrapping around (e.g., from last to first card).
     */
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