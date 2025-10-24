import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Play, Pause, ChevronLeft, ChevronRight, Home } from "lucide-react";

export default function Demo({ slides, slideDuration = 10000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPaused || currentSlide >= slides.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentSlide((prev) => prev + 1);
    }, slideDuration);

    return () => clearTimeout(timer);
  }, [currentSlide, isPaused, slides.length, slideDuration]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        navigate("/");
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [navigate]);

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="absolute left-8 top-8 z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-lg backdrop-blur transition hover:border-blue-300 hover:bg-white"
        >
          <Home size={18} />
          Home
        </button>
        <span className="text-xs uppercase tracking-[0.35em] text-blue-600/70">
          press Esc to return
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="w-full h-full transition-opacity duration-500">
          <CurrentSlideComponent />
        </div>
      </div>

      <div className="bg-white/90 border-t border-gray-200/80 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={currentSlide === 0}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePause}
              className="rounded-lg bg-blue-500 px-4 py-3 text-white transition hover:bg-blue-600"
            >
              {isPaused ? <Play size={28} /> : <Pause size={28} />}
            </button>
            <span className="text-lg font-medium text-gray-600">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={currentSlide === slides.length - 1}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
