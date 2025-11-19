import React from "react";
import BubbleSortVisualizer from "@/components/BubbleSortVisualizer.jsx";

export default function BubbleSortDemoSlide() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-6 text-slate-800">
      <h2 className="mt-4 text-8xl font-bold text-blue-600">Try It Live</h2>
      <div className="mt-8 w-full max-w-5xl">
        <BubbleSortVisualizer />
      </div>
    </div>
  );
}

