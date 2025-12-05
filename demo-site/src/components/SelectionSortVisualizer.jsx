import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useServerState, notifyListeners } from "../hooks/useServerState";


const INITIAL_VALUES = [5, 4, 3, 2, 1];
const STEP_DURATION = 2800;
const PHASE_PORTION = 0.45;
const SPOTLIGHT_DURATION = 2000;
const CARD_SWAP_OFFSET = 140;

export default function SelectionSortVisualizer() {
  const { state } = useServerState();
  const [values, setValues] = useState(() => [...INITIAL_VALUES]);
  const [stepIndex, setStepIndex] = useState(0);
  const [phaseStage, setPhaseStage] = useState("spotlight");
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [swapOffsets, setSwapOffsets] = useState({});
  const [spotlightInfo, setSpotlightInfo] = useState(null);
  const [announcement, setAnnouncement] = useState({ text: "Tap start to watch selection sort unfold", tone: "calm" });
  const [sortedIndices, setSortedIndices] = useState([]);

  const steps = useMemo(() => generateSelectionSteps(INITIAL_VALUES), []);
  const timersRef = useRef([]);
  const swapStateRef = useRef({ stepIndex: -1, performed: false });
  const prevStatusRef = useRef(state.status);

  const currentStep = steps[stepIndex] ?? null;
  const performing = phaseStage === "action" && currentStep;
  const phase = performing ? currentStep.type : "idle";
  let highlightIndices = [];
  if (performing) {
    if (["compare", "swap"].includes(currentStep.type)) {
      highlightIndices = [currentStep.i, currentStep.j].filter((idx) => typeof idx === "number");
    } else if (["newMin", "select", "settle"].includes(currentStep.type)) {
      highlightIndices = typeof currentStep.min === "number" ? [currentStep.min] : [];
    } else if (currentStep.type === "mark") {
      highlightIndices = [currentStep.index];
    }
  }
  const markFocusIndex = performing && currentStep?.type === "mark" ? currentStep.index : null;
  const minIndex = performing && typeof currentStep.min === "number" ? currentStep.min : null;

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
    setAnnouncement({ text: "Tap start to watch selection sort unfold", tone: "calm" });
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

    // Handle reset command from server or home navigation
    if ((state.status === 'playing' || state.status === 'home') && (isRunning || completed)) {
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
        setAnnouncement({ text: "Sorted! Selection sort finished", tone: "calm" });
      }
      return;
    }

    const step = steps[stepIndex];

    if (phaseStage === "spotlight") {
      setSpotlightInfo(getSelectionSpotlight(step));
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
    } else if (step.type === "newMin") {
      setAnnouncement({ text: `${step.b} becomes new minimum`, tone: "alert" });
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
      {spotlightInfo && (
        <div className="absolute left-1/2 top-10 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-sky-200 bg-white/85 px-6 py-3 text-xl font-bold tracking-wide text-sky-700 shadow-lg backdrop-blur">
          <span className="text-2xl text-sky-500">•</span>
          <span>{spotlightInfo.text}</span>
        </div>
      )}

      <motion.div className="flex flex-col gap-10" animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
          {values.map((value, index) => {
            const isActive = highlightIndices.includes(index);
            const isCompare = phase === "compare" && isActive;
            const isLift = phase === "swap" && isActive;
            const isDrop = phase === "swap" && isActive;
            const isMarking = phase === "mark" && markFocusIndex === index;
            const isMin = minIndex === index && (phase === "newMin" || phase === "select" || phase === "settle");
            const sorted = isSorted(index);

            let elevation = 0;
            if (isLift) elevation = -120;
            else if (isCompare || isMin) elevation = -52;
            else if (isDrop) elevation = -18;
            else if (isMarking) elevation = -14;
            else if (isActive) elevation = -10;

            const horizontalOffset = swapOffsets[index] ?? 0;
            const scale = isLift ? 1.18 : isCompare || isMarking || isMin ? 1.08 : isActive ? 1.04 : 1;
            const glow = sorted
              ? "0px 0px 35px rgba(16,185,129,0.4)"
              : isMin
                ? "0px 0px 45px rgba(234,179,8,0.45)"
                : isLift
                  ? "0px 0px 55px rgba(56,189,248,0.55)"
                  : isCompare
                    ? "0px 0px 38px rgba(56,189,248,0.35)"
                    : isMarking
                      ? "0px 0px 30px rgba(56,189,248,0.3)"
                      : "0px 0px 0px rgba(15,23,42,0)";

            const borderClass = sorted
              ? "border-emerald-400 bg-emerald-500/15 text-emerald-600"
              : isMin
                ? "border-amber-400 bg-amber-50 text-slate-900"
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
                className={`flex h-40 w-28 items-center justify-center rounded-[2.5rem] border-4 text-7xl font-black tracking-wide ${borderClass}`}
              >
                {value}
              </motion.div>
            );
          })}
        </div>

        <div
          className={`min-h-[1.5rem] text-center text-base sm:text-lg font-semibold uppercase tracking-[0.32em] ${
            announcement.tone === "alert" ? "text-rose-500" : "text-slate-500"
          }`}
        >
          {announcement.text}
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-4 text-base">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-7 py-3.5 text-base font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-400"
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {completed ? "Restart" : isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-slate-400 px-6 py-3.5 text-base font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-600 hover:text-slate-900"
            disabled={isRunning && !completed}
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>

        <div className="mt-8 text-center text-2xl font-extrabold text-slate-800">
          Time Complexity: <span className="text-blue-600">O(n²)</span> | Space: <span className="text-blue-600">O(1)</span>
        </div>
      </motion.div>
    </div>
  );
}

function generateSelectionSteps(arr) {
  const steps = [];
  const copy = [...arr];
  const n = copy.length;

  for (let i = 0; i < n - 1; i += 1) {
    let minIndex = i;
    steps.push({ type: "select", i, min: minIndex, value: copy[minIndex] });

    for (let j = i + 1; j < n; j += 1) {
      const a = copy[minIndex];
      const b = copy[j];
      steps.push({ type: "compare", i: minIndex, j, min: minIndex, a, b });
      if (b < a) {
        minIndex = j;
        steps.push({ type: "newMin", min: minIndex, i, j, a: copy[i], b });
      }
    }

    if (minIndex !== i) {
      steps.push({ type: "swap", i, j: minIndex, a: copy[i], b: copy[minIndex] });
      [copy[i], copy[minIndex]] = [copy[minIndex], copy[i]];
    } else {
      steps.push({ type: "settle", i, min: minIndex, value: copy[i] });
    }

    steps.push({ type: "mark", index: i, value: copy[i] });
  }

  steps.push({ type: "mark", index: n - 1, value: copy[n - 1] });
  steps.push({ type: "complete", values: [...copy] });
  return steps;
}

function getSelectionSpotlight(step) {
  if (!step) return null;

  switch (step.type) {
    case "select":
      return { values: [step.value], text: `Start with slot ${step.i + 1} as minimum` };
    case "compare":
      return { values: [step.a, step.b], text: `Compare ${step.a} to ${step.b}` };
    case "newMin":
      return { values: [step.b], text: `${step.b} is the new minimum` };
    case "swap":
      return { values: [step.a, step.b], text: "Swap current slot with minimum" };
    case "settle":
      return { values: [step.value], text: "Minimum already in place" };
    case "mark":
      return { values: [step.value], text: `Lock ${step.value} into place` };
    case "complete":
      return { values: step.values ?? [], text: "Sorted! Selection sort finished" };
    default:
      return { values: step.a !== undefined ? [step.a, step.b] : [], text: "Next step" };
  }
}
