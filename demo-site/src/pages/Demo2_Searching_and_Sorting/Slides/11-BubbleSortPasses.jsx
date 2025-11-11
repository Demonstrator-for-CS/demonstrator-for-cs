import React from "react";

const steps = [
  { label: "1", text: "Start at the first pair of numbers." },
  { label: "2", text: "Compare the pair. If the left value is greater, swap them." },
  { label: "3", text: "Move one position to the right and repeat comparisons." },
  { label: "4", text: "After each pass, the largest unsorted value settles on the far right." },
  { label: "5", text: "Shrink the range and keep bubbling until no swaps are required." },
];

export default function BubbleSortPasses() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-8 text-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Slide 11</p>
      <h2 className="mt-4 text-4xl font-semibold text-blue-600">One Pass at a Time</h2>
      <ul className="mt-10 w-full max-w-3xl space-y-4">
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-left shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
              {step.label}
            </span>
            <p className="text-lg leading-relaxed">{step.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
