import React from "react";

export default function BubbleSortIntro() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-8 text-center text-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Slide 10</p>
      <h1 className="mt-4 text-5xl font-semibold text-blue-600">Bubble Sort</h1>
      <p className="mt-8 max-w-3xl text-2xl leading-relaxed">
        Bubble sort repeatedly compares adjacent values and swaps them when they are out of order. Small values "bubble"
        toward the front, one pass at a time, until the entire list is sorted.
      </p>
    </div>
  );
}
