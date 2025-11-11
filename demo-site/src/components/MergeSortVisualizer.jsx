import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";

const DEFAULT_INTERVAL = 1400;
const PHASE_PORTION = 0.55;

export default function MergeSortVisualizer() {
  const [baseNumbers, setBaseNumbers] = useState(() => generateRandomNumbers());
  const [selected, setSelected] = useState([]);
  const [values, setValues] = useState(() => []);
  const [operations, setOperations] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_INTERVAL);
  const [completed, setCompleted] = useState(false);

  const timersRef = useRef([]);

  const dataset = useMemo(() => {
    if (selected.length === 0) return [...baseNumbers];
    const sortedIndices = [...selected].sort((a, b) => a - b);
    return sortedIndices.map((idx) => baseNumbers[idx]);
  }, [baseNumbers, selected]);

  const clampedIndex = operations.length ? Math.min(stepIndex, operations.length - 1) : -1;
  const currentOp = clampedIndex >= 0 ? operations[clampedIndex] : null;
  const activePair = currentOp?.type === "compare" ? currentOp.indices.filter((i) => i >= 0) : [];
  const writingIndex = currentOp?.type === "write" ? currentOp.index : null;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((handle) => clearTimeout(handle));
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((handle) => {
    timersRef.current.push(handle);
  }, []);

  useEffect(() => {
    clearTimers();
    setValues([...dataset]);
    setOperations([]);
    setStepIndex(0);
    setIsRunning(false);
    setCompleted(false);
  }, [dataset, clearTimers]);

  const resetVisualizer = useCallback(() => {
    clearTimers();
    setOperations([]);
    setStepIndex(0);
    setIsRunning(false);
    setCompleted(false);
    setValues([...dataset]);
  }, [clearTimers, dataset]);

  const startRun = useCallback(() => {
    if (dataset.length < 2) {
      resetVisualizer();
      return;
    }
    const snapshot = [...dataset];
    const ops = generateMergeOperations(snapshot);
    setValues(snapshot);
    setOperations(ops);
    setStepIndex(0);
    setCompleted(false);
    setIsRunning(true);
  }, [dataset, resetVisualizer]);

  useEffect(() => {
    clearTimers();

    if (!isRunning || stepIndex >= operations.length) {
      if (isRunning && stepIndex >= operations.length && operations.length) {
        setCompleted(true);
        setIsRunning(false);
      }
      return;
    }

    const op = operations[stepIndex];
    const duration = op.type === "write" ? speed : speed * PHASE_PORTION;

    const handle = setTimeout(() => {
      if (op.type === "write") {
        setValues((prev) => {
          const next = [...prev];
          next[op.index] = op.value;
          return next;
        });
      }
      setStepIndex((prev) => prev + 1);
    }, duration);

    scheduleTimer(handle);

    return () => clearTimers();
  }, [isRunning, stepIndex, operations, speed, scheduleTimer, clearTimers]);

  const handleToggle = () => {
    if (completed || operations.length === 0) {
      startRun();
      return;
    }

    setIsRunning((prev) => !prev);
  };

  const shuffleNumbers = () => {
    setBaseNumbers(generateRandomNumbers());
    setSelected([]);
  };

  const toggleSelection = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((value) => value !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-4 text-slate-900 shadow-sm">
        <header className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
            Choose numbers to sort
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Pick any subset of the 10 random values or use them all.
          </p>
        </header>
        <div className="flex flex-wrap justify-center gap-2">
          {baseNumbers.map((num, idx) => {
            const active = selected.includes(idx);
            return (
              <button
                key={`${num}-${idx}`}
                type="button"
                onClick={() => toggleSelection(idx)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-semibold uppercase tracking-[0.35em]">
          <button
            type="button"
            onClick={() => setSelected(baseNumbers.map((_, idx) => idx))}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-600 hover:border-slate-500"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-600 hover:border-slate-500"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={shuffleNumbers}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-600 hover:border-slate-500"
          >
            Shuffle values
          </button>
        </div>
      </section>

      <div className="w-full rounded-[32px] border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl">
        <div className="flex flex-col gap-8">
          <header className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              {dataset.length} values
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-blue-600">
              {completed ? "Sorted" : "Merge Sort Animation"}
            </h3>
          </header>

          <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
            {values.map((value, index) => {
              const isCompare = activePair.includes(index);
              const isWrite = writingIndex === index;
              const elevation = isWrite ? -90 : isCompare ? -60 : 0;
              const scale = isCompare || isWrite ? 1.12 : 1;
              const glow = isWrite
                ? "0px 0px 55px rgba(14,165,233,0.45)"
                : isCompare
                  ? "0px 0px 35px rgba(14,165,233,0.35)"
                  : completed
                    ? "0px 0px 30px rgba(16,185,129,0.35)"
                    : "0px 0px 0px rgba(15,23,42,0)";

              return (
                <motion.div
                  layout
                  key={`${value}-${index}`}
                  transition={{
                    layout: { type: "spring", stiffness: 380, damping: 30 },
                    y: { type: "spring", stiffness: 320, damping: 24 },
                  }}
                  animate={{ y: elevation, scale, boxShadow: glow }}
                  className={`flex h-32 w-20 items-center justify-center rounded-[2.25rem] border-4 text-4xl font-black tracking-wide ${
                    isCompare || isWrite
                      ? "border-sky-400 bg-sky-50 text-slate-900"
                      : "border-slate-300 bg-slate-50 text-slate-700"
                  }`}
                >
                  {value}
                </motion.div>
              );
            })}
          </div>

          <div className="min-h-[1.5rem] text-center text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            {statusMessage(currentOp, values, completed)}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-sky-400"
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {completed || operations.length === 0 ? "Start" : isRunning ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={resetVisualizer}
              className="inline-flex items-center gap-2 rounded-full border border-slate-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-600 hover:text-slate-900"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            <label className="flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">
              Speed ({Math.round(speed / 100) / 10}s)
              <input
                type="range"
                min="300"
                max="2200"
                step="100"
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
                className="w-56 accent-sky-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMergeOperations(numbers) {
  const arr = [...numbers];
  const aux = Array(arr.length);
  const ops = [];

  function mergeSort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  function merge(lo, mid, hi) {
    for (let k = lo; k <= hi; k += 1) {
      aux[k] = arr[k];
    }
    let i = lo;
    let j = mid + 1;

    for (let k = lo; k <= hi; k += 1) {
      if (i > mid) {
        ops.push({ type: "write", index: k, value: aux[j] });
        arr[k] = aux[j];
        j += 1;
      } else if (j > hi) {
        ops.push({ type: "write", index: k, value: aux[i] });
        arr[k] = aux[i];
        i += 1;
      } else {
        ops.push({ type: "compare", indices: [i, j] });
        if (aux[i] <= aux[j]) {
          ops.push({ type: "write", index: k, value: aux[i] });
          arr[k] = aux[i];
          i += 1;
        } else {
          ops.push({ type: "write", index: k, value: aux[j] });
          arr[k] = aux[j];
          j += 1;
        }
      }
    }
  }

  mergeSort(0, arr.length - 1);
  ops.push({ type: "complete" });
  return ops;
}

function generateRandomNumbers() {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);
}

function statusMessage(op, values, isFinished = false) {
  if (isFinished) {
    return "Sorted! Merge sort finished";
  }
  if (!op) {
    return "Tap start to watch merge sort unfold";
  }
  if (op.type === "compare") {
    const [left, right] = op.indices;
    const leftVal = left >= 0 ? values[left] ?? "?" : "";
    const rightVal = right >= 0 ? values[right] ?? "?" : "";
    return `Comparing ${leftVal} and ${rightVal}`;
  }
  if (op.type === "write") {
    return `Placing ${op.value} into position ${op.index + 1}`;
  }
  if (op.type === "complete") {
    return "Sorted! Merge sort finished";
  }
  return "";
}

