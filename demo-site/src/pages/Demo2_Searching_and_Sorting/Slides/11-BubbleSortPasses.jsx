import React from "react";

const steps = [
    "Start at the first pair of numbers.",
    "Compare the pair. If the left value is greater, swap them.",
    "Move one position to the right and repeat comparisons.",
    "After each pass, the largest unsorted value settles on the far right.",
    "Shrink the range and keep bubbling until no swaps are required."
];

export default function BubbleSortPasses() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-10 text-slate-800">
      <h2 className="mt-4 text-9xl font-bold text-blue-600">One Pass at a Time</h2>
        <ul className="max-w-4xl space-y-6 text-left mt-10">
            {steps.map((text, idx) => (
                <li key={idx} className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 text-2xl shadow-sm">
                    <span className="font-semibold text-blue-500 mr-3 text-3xl align-middle">{idx + 1}.</span>
                    {text}
                </li>
            ))}
        </ul>
    </div>
  );
}
