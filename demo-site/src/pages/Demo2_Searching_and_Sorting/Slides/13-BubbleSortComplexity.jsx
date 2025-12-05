import React from "react";

export default function BubbleSortComplexity() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-8 text-slate-800">
      <h2 className="mt-4 text-8xl font-bold text-blue-600">Bubble Sort Complexity</h2>
      <div className="mt-8 w-full max-w-5xl rounded-3xl border border-slate-200 bg-slate-50 px-8 py-6 text-left shadow-md">
        <h3 className="text-3xl font-bold text-slate-900">Algorithm Complexity</h3>
        <p className="mt-3 text-xl text-slate-700">
          Time: O(n²) on average and in the worst case; best case O(n) if the list is already sorted.
        </p>
        <p className="mt-3 text-xl text-slate-700">
          Why O(n²)? Bubble sort repeatedly compares adjacent pairs across the list. As n grows, the number of pair checks
          grows roughly with n × n.
        </p>
        <p className="mt-3 text-xl text-slate-700">Space: O(1) additional space (in-place swaps).</p>
      </div>
    </div>
  );
}
