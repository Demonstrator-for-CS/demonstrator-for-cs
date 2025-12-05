import React from "react";

export default function SelectionSortComplexity() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-8 text-slate-800">
      <h2 className="mt-4 text-8xl font-bold text-blue-600">Selection Sort Complexity</h2>
      <div className="mt-8 w-full max-w-5xl rounded-3xl border border-slate-200 bg-slate-50 px-8 py-6 text-left shadow-md">
        <h3 className="text-3xl font-bold text-slate-900">Algorithm Complexity</h3>
        <p className="mt-3 text-xl text-slate-700">
          Time: O(n²) — each position scans the remaining unsorted items, so work grows with the square of the list size.
        </p>
        <p className="mt-3 text-xl text-slate-700">
          Why O(n²)? For n items, you do roughly n comparisons for the first slot, n for the next, and so on; that repeated
          scanning adds up to about n × n steps.
        </p>
        <p className="mt-3 text-xl text-slate-700">Space: O(1) extra space; basic selection sort is not stable.</p>
      </div>
    </div>
  );
}
