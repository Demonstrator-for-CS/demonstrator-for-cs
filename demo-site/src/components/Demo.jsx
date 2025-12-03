import { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useServerState } from '@/hooks/useServerState';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Demo({ slides, slideDuration }) {
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
        </div>
    );
}
