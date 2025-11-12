import React from "react";
import BubbleSortVisualizer from "@/components/BubbleSortVisualizer.jsx";

export default function BubbleSortDemoSlide() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-6 text-slate-800">
      <h2 className="mt-4 text-8xl font-bold text-blue-600">Try It Live</h2>
      <p className="mt-4 max-w-3xl text-center text-lg text-slate-600">
        Press start to bubble the numbers in descending order. Adjust the speed slider to watch the passes glide faster or slower.
      </p>
      <div className="mt-8 w-full max-w-5xl">
        <BubbleSortVisualizer />
      </div>
    </div>
  );
}
