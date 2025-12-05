import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useServerState } from '@/hooks/useServerState';

export default function Demo({ slides}) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [, setIsPaused] = useState(false);
    const { state} = useServerState();
    const lastServerSlide = useRef(null);

    const clampIndex = useCallback(
        (idx) => {
            if (!slides || slides.length === 0) return 0;
            return Math.min(Math.max(idx, 0), slides.length - 1);
        },
        [slides]
    );

    useEffect(() => {
        setCurrentSlide((prev) => clampIndex(prev));
    }, [slides, clampIndex]);

    // Sync with server state only when controller is active
    useEffect(() => {
        const controllerActive = state.status === 'playing' || state.status === 'paused' || state.status === 'sorting' || state.status === 'home';
        if (controllerActive && typeof state.current_slide === 'number') {
            const next = clampIndex(state.current_slide);
            if (next !== lastServerSlide.current) {
                lastServerSlide.current = next;
                setCurrentSlide(next);
            }
        }
        if (state.status === 'playing') {
            setIsPaused(false);
        } else if (state.status === 'paused') {
            setIsPaused(true);
        } else if (state.status === 'home') {
            // Reset to first slide when navigating home
            setCurrentSlide(0);
            lastServerSlide.current = 0;
            setIsPaused(true);
        }
    }, [state.current_slide, state.status, clampIndex]);

    // Removed autoplay functionality - manual interaction only

    const goToNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const goToPrevious = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    // Listen for key presses
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowRight') {
                goToNext();
            } else if (event.key === 'ArrowLeft') {
                goToPrevious();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentSlide]);

    const CurrentSlideComponent = slides[currentSlide]?.component;
    if (!CurrentSlideComponent) return null;

    // Extract logic gates controller input if available
    const controllerInput = state.controller_input || {};
    const inputA = controllerInput.inputA !== undefined ? controllerInput.inputA : undefined;
    const inputB = controllerInput.inputB !== undefined ? controllerInput.inputB : undefined;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full transition-opacity duration-500">
                    <CurrentSlideComponent controllerInputA={inputA} controllerInputB={inputB} />
                </div>
            </div>

            {/* QR Code in top right corner */}
            <div className="absolute top-6 right-6 bg-white p-4 rounded-lg shadow-lg">
                <QRCode
                    value="https://demonstrator-for-cs.github.io/"
                    size={128}
                    level="M"
                />
                <p className="text-m text-center mt-2 text-gray-600">Scan to interact</p>
            </div>
        </div>
    );
}
