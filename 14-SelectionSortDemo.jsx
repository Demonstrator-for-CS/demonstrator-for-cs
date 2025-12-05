import React from "react";
import { motion } from "framer-motion";
import SelectionSortVisualizer from "@/components/SelectionSortVisualizer.jsx";

export default function SelectionSortDemoSlide() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-6 text-slate-800">
      <h2 className="mt-4 text-9xl font-bold text-blue-600">Selection Sort</h2>

      <div className="relative mt-10 w-full max-w-7xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="z-10 mb-6 w-full max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 px-7 py-6 text-left shadow-md lg:absolute lg:top-6 lg:right-full lg:mr-10 lg:translate-x-20 lg:mb-0 lg:w-[360px]"
        >
          <h3 className="text-3xl font-bold text-slate-800">Algorithm Complexity</h3>
          <p className="mt-3 text-xl text-slate-700">
            Time: O(n^2) â€?each position scans the remaining unsorted items, so work grows with the square of the list size.
          </p>
          <p className="mt-2 text-xl text-slate-700">
            Why O(n^2)? For n items, you do roughly n comparisons for the first slot, n for the next, and so on; that repeated
            scanning adds up to about n x n steps.
          </p>
          <p className="mt-2 text-xl text-slate-700">Space: O(1) extra space; basic selection sort is not stable.</p>
        </motion.div>

        <div className="flex w-full flex-col items-center justify-center gap-4">
          <div className="w-full max-w-5xl">
            <SelectionSortVisualizer />
          </div>
          <div className="mt-8 text-center text-2xl font-extrabold text-slate-800">
            Time Complexity: <span className="text-blue-600">O(n^2)</span> | Space: <span className="text-blue-600">O(1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

