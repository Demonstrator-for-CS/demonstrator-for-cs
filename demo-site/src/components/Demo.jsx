import { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useServerState } from '@/hooks/useServerState';

export default function Demo({ slides, slideDuration = 10000 }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const { state} = useServerState();

    // Sync with server state
    useEffect(() => {
        if (state.current_slide !== undefined) {
            setCurrentSlide(state.current_slide);
        }
        if (state.status === 'playing') {
            setIsPaused(false);
        } else if (state.status === 'paused') {
            setIsPaused(true);
        }
    }, [state.current_slide, state.status]);

    useEffect(() => {
        if (isPaused || currentSlide >= slides.length - 1) return;

        const timer = setTimeout(() => {
            setCurrentSlide(prev => prev + 1);
        }, slideDuration);

        return () => {
            clearTimeout(timer);
        };
    }, [currentSlide, isPaused, slides.length, slideDuration]);

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

    const togglePause = () => {
        setIsPaused(prev => !prev);
    };

    const CurrentSlideComponent = slides[currentSlide].component;

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

            {/* Controls */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goToPrevious}
                            disabled={currentSlide === 0}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={togglePause}
                                className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                            >
                                {isPaused ? <Play size={28} /> : <Pause size={28} />}
                            </button>
                            <span className="text-lg font-medium text-gray-600">
                                {currentSlide + 1} / {slides.length}
                            </span>
                        </div>

                        <button
                            onClick={goToNext}
                            disabled={currentSlide === slides.length - 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

