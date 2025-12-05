import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useServerState } from "../hooks/useServerState";

const INITIAL_VALUES = [5, 4, 3, 2, 1];
const STEP_DURATION = 2800;
const PHASE_PORTION = 0.45;
const SPOTLIGHT_DURATION = 2000;
const CARD_SWAP_OFFSET = 140;

export default function BubbleSortVisualizer() {
  const { state } = useServerState();
  const [values, setValues] = useState(() => [...INITIAL_VALUES]);
  const [stepIndex, setStepIndex] = useState(0);
  const [phaseStage, setPhaseStage] = useState("spotlight");
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [swapOffsets, setSwapOffsets] = useState({});
  const [spotlightInfo, setSpotlightInfo] = useState(null);
  const [announcement, setAnnouncement] = useState({ text: "Tap start to watch bubble sort unfold", tone: "calm" });
  const [sortedIndices, setSortedIndices] = useState([]);

  const steps = useMemo(() => generateBubbleSteps(INITIAL_VALUES), []);
  const timersRef = useRef([]);
  const swapStateRef = useRef({ stepIndex: -1, performed: false });
  const prevStatusRef = useRef(state.status);

  const currentStep = steps[stepIndex] ?? null;
  const performing = phaseStage === "action" && currentStep;
  const phase = performing ? currentStep.type : "idle";
  const highlightIndices =
    performing && typeof currentStep.i === "number" && typeof currentStep.j === "number"
      ? [currentStep.i, currentStep.j]
      : [];
  const markFocusIndex = performing && currentStep?.type === "mark" ? currentStep.index : null;

  const isSorted = useCallback((idx) => sortedIndices.includes(idx), [sortedIndices]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((handle) => clearTimeout(handle));
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setValues(() => [...INITIAL_VALUES]);
    setStepIndex(0);
    setPhaseStage("spotlight");
    setIsRunning(false);
    setCompleted(false);
    setSwapOffsets({});
    setSpotlightInfo(null);
    setAnnouncement({ text: "Tap start to watch bubble sort unfold", tone: "calm" });
    setSortedIndices([]);
    swapStateRef.current = { stepIndex: -1, performed: false };
  }, [clearTimers]);

  const toggle = useCallback(() => {
    if (completed) {
      reset();
      setIsRunning(true);
      return;
    }
    setIsRunning((prev) => !prev);
  }, [completed, reset]);

  // Listen for server commands
  useEffect(() => {
    // Handle play command from server
    if (state.status === 'sorting' && prevStatusRef.current !== 'sorting' && !isRunning) {
      toggle();
    }

    // Handle reset command from server
    if (state.status === 'playing' && (isRunning || completed)) {
      reset();
    }

    prevStatusRef.current = state.status;
  }, [state.status, isRunning, completed, toggle, reset]);

  useEffect(() => {
    clearTimers();

    if (!isRunning || stepIndex >= steps.length) {
      if (stepIndex >= steps.length && !completed) {
        setCompleted(true);
        setIsRunning(false);
        setPhaseStage("spotlight");
        setSpotlightInfo(null);
        setAnnouncement({ text: "Sorted! Bubble sort finished", tone: "calm" });
      }
      return;
    }

    const step = steps[stepIndex];

    if (phaseStage === "spotlight") {
      setSpotlightInfo(getBubbleSpotlight(step));
      const overlayHandle = setTimeout(() => {
        setSpotlightInfo(null);
        setPhaseStage("action");
      }, SPOTLIGHT_DURATION);
      timersRef.current.push(overlayHandle);
      return () => clearTimers();
    }

    if (step.type !== "swap") {
      setSwapOffsets((prev) => (Object.keys(prev).length ? {} : prev));
    }

    if (step.type === "compare") {
      setAnnouncement({ text: `Compare ${step.a} and ${step.b}`, tone: "alert" });
      const calmHandle = setTimeout(() => {
        setAnnouncement((prev) => ({ ...prev, tone: "calm" }));
      }, STEP_DURATION * PHASE_PORTION);
      timersRef.current.push(calmHandle);
    } else if (step.type === "swap") {
      if (swapStateRef.current.stepIndex !== stepIndex) {
        swapStateRef.current = { stepIndex, performed: false };
        setSwapOffsets({
          [step.i]: CARD_SWAP_OFFSET,
          [step.j]: -CARD_SWAP_OFFSET,
        });
        setAnnouncement({ text: `Swap ${step.a} and ${step.b}`, tone: "alert" });
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
          setAnnouncement({ text: "Swap complete", tone: "calm" });
          return next;
        });
      }, STEP_DURATION * PHASE_PORTION);
      timersRef.current.push(swapHandle);

      const advanceHandle = setTimeout(() => {
        swapStateRef.current = { stepIndex: -1, performed: false };
        setPhaseStage("spotlight");
        setStepIndex((prev) => prev + 1);
      }, STEP_DURATION);
      timersRef.current.push(advanceHandle);

      return () => clearTimers();
    } else if (step.type === "mark") {
      const markHandle = setTimeout(() => {
        setSortedIndices((prev) => (prev.includes(step.index) ? prev : [...prev, step.index]));
        setPhaseStage("spotlight");
        setStepIndex((prev) => prev + 1);
      }, STEP_DURATION * 0.3);
      timersRef.current.push(markHandle);
      return () => clearTimers();
    }

    const advanceHandle = setTimeout(() => {
      setPhaseStage("spotlight");
      setStepIndex((prev) => prev + 1);
    }, STEP_DURATION);

    timersRef.current.push(advanceHandle);

    return () => clearTimers();
  }, [isRunning, stepIndex, steps, phaseStage, clearTimers, completed]);

  return (
    <div className="relative w-full rounded-[32px] border border-slate-200 bg-white px-16 pt-36 pb-16 text-slate-900 shadow-2xl overflow-hidden min-h-[40rem]">
      <AnimatePresence>
        {spotlightInfo && (
          <motion.div
            key="spotlight"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-slate-950/75 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {spotlightInfo.values.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-6">
                {spotlightInfo.values.map((value, idx) => (
                  <motion.div
                    key={`${value}-${idx}-spotlight`}
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-44 w-28 items-center justify-center rounded-[2.75rem] border-4 border-sky-400 bg-white text-6xl font-black text-slate-800 shadow-2xl sm:w-32"
                  >
                    {value}
                  </motion.div>
                ))}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.25 }}
              className="px-4 text-center text-3xl font-black uppercase tracking-[0.35em] text-rose-400 sm:text-4xl"
            >
              {spotlightInfo.text}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex flex-col gap-8"
        animate={{ opacity: spotlightInfo ? 0.08 : 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
          {values.map((value, index) => {
            const isActive = highlightIndices.includes(index);
            const isCompare = phase === "compare" && isActive;
            const isLift = phase === "lift" && isActive;
            const isGlide = phase === "swap" && isActive;
            const isDrop = phase === "drop" && isActive;
            const isSettle = phase === "settle" && isActive;
            const isMarking = phase === "mark" && markFocusIndex === index;
            const sorted = isSorted(index);

            let elevation = 0;
            if (isLift || isGlide) elevation = -120;
            else if (isCompare) elevation = -52;
            else if (isDrop || isSettle) elevation = -18;
            else if (isMarking) elevation = -14;
            else if (isActive) elevation = -10;

            const horizontalOffset = swapOffsets[index] ?? 0;
            const scale = isLift || isGlide ? 1.18 : isCompare || isMarking ? 1.08 : isActive ? 1.04 : 1;
            const glow = sorted
              ? "0px 0px 35px rgba(16,185,129,0.4)"
              : isLift || isGlide
                ? "0px 0px 55px rgba(56,189,248,0.55)"
                : isCompare
                  ? "0px 0px 38px rgba(56,189,248,0.35)"
                  : isMarking
                    ? "0px 0px 30px rgba(56,189,248,0.3)"
                    : "0px 0px 0px rgba(15,23,42,0)";

            const borderClass = sorted
              ? "border-emerald-400 bg-emerald-500/15 text-emerald-600"
              : isActive || isMarking
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

        <div
          className={`min-h-[1.5rem] text-center text-sm font-semibold uppercase tracking-[0.4em] ${
            announcement.tone === "alert" ? "text-rose-500" : "text-slate-500"
          }`}
        >
          {announcement.text}
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-4">
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
      </motion.div>
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
    steps.push({ type: "mark", index: n - i - 1, value: copy[n - i - 1] });
  }

  steps.push({ type: "mark", index: 0, value: copy[0] });
  steps.push({ type: "complete", values: [...copy] });
  return steps;
}

function getBubbleSpotlight(step) {
  if (!step) return null;

  switch (step.type) {
    case "compare":
      return { values: [step.a, step.b], text: `Compare ${step.a} and ${step.b}` };
    case "lift":
      return { values: [step.a, step.b], text: "Lift them up to swap" };
    case "swap":
      return { values: [step.a, step.b], text: "Swap their positions" };
    case "drop":
      return { values: [step.a, step.b], text: "Drop them into their new spots" };
    case "settle":
      return { values: [step.a, step.b], text: "Already in order �� keep them" };
    case "mark":
      return { values: [step.value], text: `Lock ${step.value} into place` };
    case "complete":
      return { values: step.values ?? [], text: "Sorted! Bubble sort finished" };
    default:
      return { values: step.a !== undefined ? [step.a, step.b] : [], text: "Next step" };
  }
}
