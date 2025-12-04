import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";

const INITIAL_VALUES = [5, 4, 3, 2, 1];
const STEP_DURATION = 2800;
const SWAP_OFFSET = 140;
const PHASE_PORTION = 0.45;

export default function SelectionSortVisualizer() {
  const steps = useMemo(() => buildSelectionSteps(INITIAL_VALUES), []);
  const [values, setValues] = useState(() => [...INITIAL_VALUES]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [swapOffsets, setSwapOffsets] = useState({});
  const [announcement, setAnnouncement] = useState({ text: "Tap start to watch selection sort", tone: "calm" });
  const [sortedIndices, setSortedIndices] = useState([]);
  const timersRef = useRef([]);
  const swapStateRef = useRef({ stepIndex: -1, performed: false });

  const current = steps[stepIndex] ?? null;
  const highlight = current ? current.highlight ?? [] : [];
  const minIndex = current?.minIndex ?? null;
  const phase = current?.type ?? "idle";

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((h) => clearTimeout(h));
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setValues(() => [...INITIAL_VALUES]);
    setStepIndex(0);
    setIsRunning(false);
    setSwapOffsets({});
    setAnnouncement({ text: "Tap start to watch selection sort", tone: "calm" });
    setSortedIndices([]);
    swapStateRef.current = { stepIndex: -1, performed: false };
  }, [clearTimers]);

  useEffect(() => {
    clearTimers();
    if (!isRunning || stepIndex >= steps.length) return;

    const step = steps[stepIndex];

    if (step.type === "compare") {
      setAnnouncement({ text: `Compare ${step.a} and ${step.b}`, tone: "alert" });
      const calmHandle = setTimeout(() => setAnnouncement((p) => ({ ...p, tone: "calm" })), STEP_DURATION * PHASE_PORTION);
      timersRef.current.push(calmHandle);
    } else if (step.type === "newMin") {
      setAnnouncement({ text: `${step.b} is new minimum`, tone: "alert" });
      const calmHandle = setTimeout(() => setAnnouncement((p) => ({ ...p, tone: "calm" })), STEP_DURATION * PHASE_PORTION);
      timersRef.current.push(calmHandle);
    } else if (step.type === "swap") {
      if (swapStateRef.current.stepIndex !== stepIndex) {
        swapStateRef.current = { stepIndex, performed: false };
        setSwapOffsets({ [step.i]: SWAP_OFFSET, [step.j]: -SWAP_OFFSET });
        setAnnouncement({ text: `Swap ${step.a} and ${step.b}`, tone: "alert" });
      }
      const doSwap = setTimeout(() => {
        setValues((prev) => {
          if (swapStateRef.current.stepIndex !== stepIndex || swapStateRef.current.performed) return prev;
          const next = [...prev];
          [next[step.i], next[step.j]] = [next[step.j], next[step.i]];
          swapStateRef.current.performed = true;
          setSwapOffsets({});
          setAnnouncement({ text: "Swap complete", tone: "calm" });
          return next;
        });
      }, STEP_DURATION * PHASE_PORTION);
      timersRef.current.push(doSwap);
    } else if (step.type === "mark") {
      const markHandle = setTimeout(() => {
        setSortedIndices((prev) => (prev.includes(step.index) ? prev : [...prev, step.index]));
      }, STEP_DURATION * 0.4);
      timersRef.current.push(markHandle);
    }

    const advance = setTimeout(() => {
      swapStateRef.current = { stepIndex: -1, performed: false };
      setStepIndex((p) => p + 1);
    }, STEP_DURATION);
    timersRef.current.push(advance);

    return () => clearTimers();
  }, [isRunning, stepIndex, steps, clearTimers]);

  const toggle = () => {
    if (stepIndex >= steps.length) {
      reset();
      setIsRunning(true);
      return;
    }
    setIsRunning((p) => !p);
  };

  const isSorted = (idx) => sortedIndices.includes(idx);

  return (
    <div className="relative w-full rounded-[32px] border border-slate-200 bg-white px-16 pt-36 pb-16 text-slate-900 shadow-2xl overflow-hidden min-h-[40rem]">
      <motion.div className="flex flex-col gap-8" animate={{ opacity: 1 }}>
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
          {values.map((value, index) => {
            const isActive = highlight.includes(index);
            const isMin = minIndex === index;
            const sorted = isSorted(index);
            const isSwapping = swapOffsets[index] !== undefined;

            const elevation = isSwapping ? -110 : isActive ? -52 : isMin ? -30 : 0;
            const scale = isSwapping ? 1.16 : isActive || isMin ? 1.08 : 1;
            const glow = sorted
              ? "0px 0px 35px rgba(16,185,129,0.4)"
              : isSwapping
                ? "0px 0px 55px rgba(56,189,248,0.55)"
                : isMin
                  ? "0px 0px 40px rgba(234,179,8,0.35)"
                  : isActive
                    ? "0px 0px 35px rgba(56,189,248,0.35)"
                    : "0px 0px 0px rgba(15,23,42,0)";

            const borderClass = sorted
              ? "border-emerald-400 bg-emerald-500/15 text-emerald-600"
              : isMin
                ? "border-amber-400 bg-amber-50 text-slate-900"
                : isActive
                  ? "border-sky-400 bg-sky-50 text-slate-900"
                  : "border-slate-300 bg-slate-50 text-slate-700";

            return (
              <motion.div
                key={`${value}-${index}`}
                layout
                transition={{
                  layout: { type: "spring", stiffness: 380, damping: 30 },
                  y: { type: "spring", stiffness: 320, damping: 24 },
                  x: { type: "spring", stiffness: 220, damping: 26 },
                }}
                animate={{
                  y: elevation,
                  x: swapOffsets[index] ?? 0,
                  scale,
                  boxShadow: glow,
                }}
                className={`flex h-40 w-28 items-center justify-center rounded-[2.75rem] border-4 text-7xl font-black tracking-wide ${borderClass}`}
              >
                {value}
              </motion.div>
            );
          })}
        </div>

        <div
          className={`min-h-[2rem] text-center text-base font-semibold uppercase tracking-[0.4em] ${
            announcement.tone === "alert" ? "text-rose-500" : "text-slate-500"
          }`}
        >
          {announcement.text}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-sky-400"
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {stepIndex >= steps.length ? "Restart" : isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-600 hover:text-slate-900"
            disabled={isRunning && stepIndex < steps.length}
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>

        <div className="mt-4 text-center text-2xl font-semibold text-slate-700">
          Time Complexity: <span className="text-blue-600">O(n^2)</span> &nbsp;|&nbsp; Space: <span className="text-blue-600">O(1)</span>
        </div>
      </motion.div>
    </div>
  );
}

function buildSelectionSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  for (let i = 0; i < n - 1; i += 1) {
    let minIdx = i;
    for (let j = i + 1; j < n; j += 1) {
      steps.push({ type: "compare", highlight: [minIdx, j], minIndex: minIdx, a: a[minIdx], b: a[j] });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({ type: "newMin", highlight: [i, minIdx], minIndex: minIdx, a: a[i], b: a[minIdx] });
      }
    }
    if (minIdx !== i) {
      const oldMin = a[minIdx];
      steps.push({ type: "swap", highlight: [i, minIdx], minIndex: minIdx, i, j: minIdx, a: a[i], b: a[minIdx] });
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
    steps.push({ type: "mark", index: i, highlight: [i], minIndex: i });
  }
  steps.push({ type: "mark", index: n - 1, highlight: [n - 1], minIndex: n - 1 });
  return steps;
}
