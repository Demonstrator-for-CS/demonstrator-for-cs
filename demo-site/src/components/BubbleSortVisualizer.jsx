import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";

const INITIAL_VALUES = [5, 4, 3, 2, 1];
const STEP_DURATION = 1200;
const PHASE_PORTION = 0.45;
const CARD_SWAP_OFFSET = 140;

export default function BubbleSortVisualizer() {
  const [values, setValues] = useState(() => [...INITIAL_VALUES]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [swapOffsets, setSwapOffsets] = useState({});

  const steps = useMemo(() => generateBubbleSteps(INITIAL_VALUES), []);
  const timersRef = useRef([]);
  const swapStateRef = useRef({ stepIndex: -1, performed: false });

  const currentStep = steps[stepIndex] ?? null;
  const phase = currentStep?.type || "idle";
  const highlightIndices = currentStep ? [currentStep.i, currentStep.j] : [];

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((handle) => clearTimeout(handle));
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((handle) => {
    timersRef.current.push(handle);
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setValues(() => [...INITIAL_VALUES]);
    setStepIndex(0);
    setIsRunning(false);
    setCompleted(false);
    setSwapOffsets({});
    swapStateRef.current = { stepIndex: -1, performed: false };
  }, [clearTimers]);

  useEffect(() => {
    clearTimers();

    if (!isRunning || stepIndex >= steps.length) {
      if (stepIndex >= steps.length && !completed) {
        setCompleted(true);
        setIsRunning(false);
      }
      return;
    }

    const step = steps[stepIndex];
    const midPoint = STEP_DURATION * PHASE_PORTION;

    if (step.type !== "swap") {
      setSwapOffsets((prev) => (Object.keys(prev).length ? {} : prev));
    }

    if (step.type === "swap") {
      if (swapStateRef.current.stepIndex !== stepIndex) {
        swapStateRef.current = { stepIndex, performed: false };
        setSwapOffsets({
          [step.i]: CARD_SWAP_OFFSET,
          [step.j]: -CARD_SWAP_OFFSET,
        });
      }

      const swapHandle = setTimeout(() => {
        setValues((prev) => {
          if (swapStateRef.current.stepIndex !== stepIndex || swapStateRef.current.performed) {
            return prev;
          }

          const { i, j, a, b } = step;
          if (prev[i] !== a || prev[j] !== b) {
            swapStateRef.current.performed = true;
            return prev;
          }

          const next = [...prev];
          [next[i], next[j]] = [next[j], next[i]];
          swapStateRef.current.performed = true;
          setSwapOffsets({});
          return next;
        });
      }, midPoint);
      scheduleTimer(swapHandle);

      const advanceHandle = setTimeout(() => {
        swapStateRef.current = { stepIndex: -1, performed: false };
        setStepIndex((prev) => prev + 1);
      }, STEP_DURATION);
      scheduleTimer(advanceHandle);

      return () => clearTimers();
    }

    const advanceHandle = setTimeout(() => {
      setStepIndex((prev) => prev + 1);
    }, STEP_DURATION);
    scheduleTimer(advanceHandle);

    return () => clearTimers();
  }, [isRunning, stepIndex, steps, clearTimers, scheduleTimer, completed]);

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
            const isActive = highlightIndices.includes(index);
            const isCompare = phase === "compare" && isActive;
            const isLift = phase === "lift" && isActive;
            const isGlide = phase === "swap" && isActive;
            const isDrop = phase === "drop" && isActive;
            const isSettle = phase === "settle" && isActive;

            let elevation = 0;
            if (isLift || isGlide) elevation = -110;
            else if (isCompare) elevation = -48;
            else if (isDrop || isSettle) elevation = -16;
            else if (isActive) elevation = -10;

            const horizontalOffset = swapOffsets[index] ?? 0;

            const scale = isActive ? (isLift || isGlide ? 1.18 : 1.08) : 1;
            const glow = isLift || isGlide
              ? "0px 0px 55px rgba(56,189,248,0.55)"
              : isCompare
                ? "0px 0px 35px rgba(56,189,248,0.3)"
                : completed
                  ? "0px 0px 30px rgba(16,185,129,0.35)"
                  : "0px 0px 0px rgba(15,23,42,0)";

            const borderClass = completed
              ? "border-emerald-400 bg-emerald-500/15 text-emerald-600"
              : isActive
                ? "border-sky-400 bg-sky-50 text-slate-900"
                : "border-slate-300 bg-slate-50 text-slate-700";

            return (
              <motion.div
                layout
                key={`${value}-${index}`}
                transition={{
                  layout: { type: "spring", stiffness: 380, damping: 30 },
                  y: { type: "spring", stiffness: 320, damping: 24 },
                  x: { type: "spring", stiffness: 220, damping: 26 },
                }}
                animate={{
                  y: elevation,
                  x: horizontalOffset,
                  scale,
                  boxShadow: glow,
                }}
                className={`flex h-36 w-24 items-center justify-center rounded-[2.5rem] border-4 text-5xl font-black tracking-wide ${borderClass}`}
              >
                {value}
              </motion.div>
            );
          })}
        </div>

        <div className="min-h-[1.5rem] text-center text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          {statusMessage(currentStep, values)}
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

function generateBubbleSteps(arr) {
  const steps = [];
  const copy = [...arr];
  const n = copy.length;

  for (let i = 0; i < n - 1; i += 1) {
    for (let j = 0; j < n - i - 1; j += 1) {
      const a = copy[j];
      const b = copy[j + 1];
      const needsSwap = a > b;

      steps.push({ type: "compare", i: j, j: j + 1, a, b });

      if (needsSwap) {
        steps.push({ type: "lift", i: j, j: j + 1, a, b });
        steps.push({ type: "swap", i: j, j: j + 1, a, b });
        [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
        steps.push({ type: "drop", i: j, j: j + 1, a: copy[j], b: copy[j + 1] });
      } else {
        steps.push({ type: "settle", i: j, j: j + 1, a, b });
      }
    }
  }

  steps.push({ type: "complete", i: -1, j: -1 });
  return steps;
}

function statusMessage(step, values) {
  if (!step) return "Tap start to watch bubble sort unfold";
  const left = step.a ?? values[step.i];
  const right = step.b ?? values[step.j];

  switch (step?.type) {
    case "compare":
      return `Comparing ${left} and ${right}`;
    case "lift":
      return `Lifting ${left} and ${right}`;
    case "swap":
      return `Swapping ${left} ? ${right}`;
    case "drop":
      return "Dropping into place";
    case "settle":
      return `${left} <= ${right} so no swap`;
    case "complete":
      return "Sorted! Bubble sort finished";
    default:
      return "";
  }
}
