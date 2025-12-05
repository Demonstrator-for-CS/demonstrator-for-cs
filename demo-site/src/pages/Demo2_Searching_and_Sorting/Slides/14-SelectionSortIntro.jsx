import React from "react";

const steps = [
  "Scan the array to find the smallest value in the unsorted portion.",
  "Swap that minimum into the current position.",
  "Advance the boundary of the sorted portion to the right.",
  "Repeat until all positions are locked in order.",
];

export default function SelectionSortIntro() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-8 text-slate-800">
      <h2 className="mt-4 text-9xl font-bold text-blue-600">Selection Sort</h2>
      <p className="mt-6 max-w-4xl text-3xl leading-relaxed text-center">
        Selection sort repeatedly selects the smallest remaining element and swaps it into place, growing a sorted prefix
        from left to right.
      </p>
      <ul className="mt-8 max-w-4xl space-y-4 text-left text-2xl leading-relaxed">
        {steps.map((text, idx) => (
          <li key={idx} className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 shadow-sm">
            <span className="mr-3 font-semibold text-blue-500">{idx + 1}.</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
