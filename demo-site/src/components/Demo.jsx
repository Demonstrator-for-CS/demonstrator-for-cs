import { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Demo({ slides }) {
    const [currentSlide, setCurrentSlide] = useState(0);

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

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full transition-opacity duration-500">
                    <CurrentSlideComponent />
                </div>
            </div>
        </div>
    );
}
