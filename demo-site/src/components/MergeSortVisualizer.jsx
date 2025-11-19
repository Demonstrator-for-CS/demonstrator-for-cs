import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";

const INITIAL_VALUES = [5, 4, 3, 2, 1];
const STEP_DURATION = 1300;
const PHASE_PORTION = 0.6;
const CARD_TRAVEL = 120;
const STAGE_LIFT = -140;

export default function MergeSortVisualizer() {
  const operations = useMemo(() => generateMergeOperations([...INITIAL_VALUES]), []);
  const [values, setValues] = useState(() => [...INITIAL_VALUES]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stageOffsets, setStageOffsets] = useState({});
  const [writeOffsets, setWriteOffsets] = useState({});
  const [narration, setNarration] = useState("Tap start to watch merge sort unfold");

  const timersRef = useRef([]);

  const currentOp = operations[stepIndex] ?? null;
  const activePair = currentOp?.type === "compare" ? currentOp.indices : [];
  const writingIndex = currentOp?.type === "write" ? currentOp.index : null;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((handle) => clearTimeout(handle));
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setValues(() => [...INITIAL_VALUES]);
    setStepIndex(0);
    setIsRunning(false);
    setCompleted(false);
    setStageOffsets({});
    setWriteOffsets({});
    setNarration("Tap start to watch merge sort unfold");
  }, [clearTimers]);

  useEffect(() => {
    clearTimers();

    if (!isRunning || stepIndex >= operations.length) {
      if (isRunning && stepIndex >= operations.length) {
        setCompleted(true);
        setIsRunning(false);
        setNarration("Sorted! Merge sort finished");
      }
      return;
    }

    const op = operations[stepIndex];
    const duration = op.type === "write" ? STEP_DURATION : STEP_DURATION * PHASE_PORTION;

    if (op.type === "compare") {
      const [leftIdx, rightIdx] = op.indices;
      setStageOffsets({
        [leftIdx]: { x: -60, y: STAGE_LIFT },
        [rightIdx]: { x: 60, y: STAGE_LIFT },
      });
      setNarration(`Compare ${op.leftValue} vs ${op.rightValue}. Choose the smaller to place next.`);
    } else {
      setStageOffsets({});
    }

    if (op.type === "write") {
      const source = typeof op.source === "number" ? op.source : op.index;
      setNarration(`Moving ${op.value} into slot ${op.index + 1}.`);
      setValues((prev) => {
        const next = [...prev];
        next[op.index] = op.value;
        return next;
      });
      setWriteOffsets((prev) => ({
        ...prev,
        [op.index]: {
          x: (source - op.index) * CARD_TRAVEL,
          y: STAGE_LIFT,
        },
      }));
    }

    if (op.type === "complete") {
      setNarration("Sorted! Merge sort finished");
    }

    const handle = setTimeout(() => {
      if (op.type === "write") {
        setWriteOffsets((prev) => {
          if (!(op.index in prev)) return prev;
          const next = { ...prev };
          delete next[op.index];
          return next;
        });
      }
      setStepIndex((prev) => prev + 1);
    }, duration);

    timersRef.current.push(handle);

    return () => clearTimers();
  }, [isRunning, stepIndex, operations, clearTimers]);

  const toggle = () => {
    if (completed) {
      reset();
      setIsRunning(true);
      return;
    }
    setIsRunning((prev) => !prev);
  };

  return (
    <div className="w-full rounded-[32px] border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
          {values.map((value, index) => {
            const isCompare = activePair.includes(index);
            const isWrite = writingIndex === index;
            const baseElevation = isWrite ? -30 : isCompare ? -20 : 0;
            const stage = stageOffsets[index] || { x: 0, y: 0 };
            const travel = writeOffsets[index] || { x: 0, y: 0 };
            const finalY = baseElevation + stage.y + travel.y;
            const finalX = stage.x + travel.x;
            const scale = isCompare || isWrite ? 1.12 : 1;
            const glow = isWrite
              ? "0px 0px 55px rgba(14,165,233,0.45)"
              : isCompare
                ? "0px 0px 35px rgba(14,165,233,0.35)"
                : completed
                  ? "0px 0px 30px rgba(16,185,129,0.35)"
                  : "0px 0px 0px rgba(15,23,42,0)";

            const borderClass = completed
              ? "border-emerald-400 bg-emerald-500/15 text-emerald-600"
              : isCompare || isWrite
                ? "border-sky-400 bg-sky-50 text-slate-900"
                : "border-slate-300 bg-slate-50 text-slate-700";

            return (
              <motion.div
                layout
                key={`${index}-${value}`}
                transition={{
                  layout: { type: "spring", stiffness: 380, damping: 30 },
                  y: { type: "spring", stiffness: 320, damping: 24 },
                  x: { type: "spring", stiffness: 280, damping: 28 },
                }}
                animate={{ y: finalY, x: finalX, scale, boxShadow: glow }}
                className={`flex h-32 w-20 items-center justify-center rounded-[2.25rem] border-4 text-4xl font-black tracking-wide ${borderClass}`}
              >
                {value}
              </motion.div>
            );
          })}
        </div>

        <div className="min-h-[1.5rem] text-center text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          {narration}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-sky-400"
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {completed ? "Restart" : isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-600 hover:text-slate-900"
            disabled={isRunning && !completed}
          >
            <RotateCcw size={18} />
            Reset
          </button>
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
        ops.push({ type: "write", index: k, value: aux[j], source: j });
        arr[k] = aux[j];
        j += 1;
      } else if (j > hi) {
        ops.push({ type: "write", index: k, value: aux[i], source: i });
        arr[k] = aux[i];
        i += 1;
      } else {
        ops.push({ type: "compare", indices: [i, j], leftValue: aux[i], rightValue: aux[j] });
        if (aux[i] <= aux[j]) {
          ops.push({ type: "write", index: k, value: aux[i], source: i });
          arr[k] = aux[i];
          i += 1;
        } else {
          ops.push({ type: "write", index: k, value: aux[j], source: j });
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



