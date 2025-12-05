import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useServerState } from "../hooks/useServerState";

const INITIAL_VALUES = [5, 4, 3, 2, 1];
const COMPARE_DURATION = 1200;
const SWAP_DURATION = 1200;
const MARK_DURATION = 700;
const SPOTLIGHT_DURATION = 800;

export default function BubbleSortVisualizer() {
  const steps = useMemo(() => generateSteps(INITIAL_VALUES), []);
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
  const [activeCompare, setActiveCompare] = useState([]);
  const [swapPair, setSwapPair] = useState([]);
  const timersRef = useRef([]);
  const swapStateRef = useRef({ stepIndex: -1, performed: false });
  const prevStatusRef = useRef(state.status);

  const currentStep = steps[stepIndex] ?? null;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setValues(() => [...INITIAL_VALUES]);
    setStepIndex(0);
    setIsRunning(false);
    setCompleted(false);
    setAnnouncement({ text: "Tap start to watch bubble sort unfold", tone: "calm" });
    setSortedIndices([]);
    setActiveCompare([]);
    setSwapPair([]);
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
        setAnnouncement({ text: "Sorted! Bubble sort finished", tone: "calm" });
      }
      return;
    }

    const step = steps[stepIndex];

    if (step.type === "spotlight") {
      const t = setTimeout(() => setStepIndex((p) => p + 1), SPOTLIGHT_DURATION);
      timersRef.current.push(t);
      return () => clearTimers();
    }

    if (step.type === "compare") {
      setActiveCompare([step.i, step.j]);
      setAnnouncement({
        text: `${step.a} vs ${step.b} — ${step.needsSwap ? "swap" : "keep order"}`,
        tone: step.needsSwap ? "alert" : "calm",
      });
      const t = setTimeout(() => setStepIndex((p) => p + 1), COMPARE_DURATION);
      timersRef.current.push(t);
      return () => clearTimers();
    }

    if (step.type === "swap") {
      setSwapPair([step.i, step.j]);
      setAnnouncement({ text: `Swapping ${step.a} and ${step.b}`, tone: "alert" });

      const doSwap = setTimeout(() => {
        setValues((prev) => {
          const next = [...prev];
          [next[step.i], next[step.j]] = [next[step.j], next[step.i]];
          return next;
        });
      }, SWAP_DURATION * 0.4);
      const endSwap = setTimeout(() => {
        setSwapPair([]);
        setActiveCompare([]);
        setAnnouncement({ text: "Swap complete", tone: "calm" });
        setStepIndex((p) => p + 1);
      }, SWAP_DURATION);
      timersRef.current.push(doSwap, endSwap);
      return () => clearTimers();
    }

    if (step.type === "mark") {
      setAnnouncement({ text: `Lock ${step.value} into place`, tone: "calm" });
      const t = setTimeout(() => {
        setSortedIndices((prev) => (prev.includes(step.index) ? prev : [...prev, step.index]));
        setStepIndex((p) => p + 1);
      }, MARK_DURATION);
      timersRef.current.push(t);
      return () => clearTimers();
    }
  }, [isRunning, stepIndex, steps, clearTimers, completed]);

  return (
    <div className="relative w-full rounded-[32px] border border-slate-200 bg-white px-16 pt-36 pb-16 text-slate-900 shadow-2xl overflow-hidden min-h-[40rem]">
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
          {values.map((value, index) => {
            const isCompare = activeCompare.includes(index);
            const isSwap = swapPair.includes(index);
            const isMark = sortedIndices.includes(index);

            const elevation = isSwap ? -30 : isCompare ? -20 : 0;
            const scale = isSwap ? 1.12 : isCompare ? 1.08 : 1;
            const glow = isMark
              ? "0px 0px 35px rgba(16,185,129,0.45)"
              : isSwap
                ? "0px 0px 45px rgba(56,189,248,0.45)"
                : isCompare
                  ? "0px 0px 35px rgba(56,189,248,0.35)"
                  : "0px 0px 0px rgba(15,23,42,0)";
            const borderClass = isMark
              ? "border-emerald-400 bg-emerald-500/15 text-emerald-600"
              : isSwap || isCompare
                ? "border-sky-400 bg-sky-50 text-slate-900"
                : "border-slate-300 bg-slate-50 text-slate-700";

            return (
              <motion.div
                key={`${value}-${index}`}
                layout
                transition={{
                  layout: { type: "spring", stiffness: 320, damping: 30 },
                  y: { type: "spring", stiffness: 320, damping: 26 },
                  scale: { type: "spring", stiffness: 280, damping: 22 },
                }}
                animate={{ y: elevation, scale, boxShadow: glow }}
                className={`flex h-40 w-28 items-center justify-center rounded-[2.75rem] border-4 text-7xl font-black tracking-wide ${borderClass}`}
              >
                {value}
              </motion.div>
            );
          })}
        </div>

        <div className="min-h-[2rem] text-center text-base font-semibold uppercase tracking-[0.4em] text-slate-500">
          {announcement.text}
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-4">
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
      </div>
    </div>
  );
}

function generateSteps(arr) {
  const steps = [];
  const copy = [...arr];
  const n = copy.length;

  for (let i = 0; i < n - 1; i += 1) {
    for (let j = 0; j < n - i - 1; j += 1) {
      const a = copy[j];
      const b = copy[j + 1];
      const needsSwap = a > b;
      steps.push({ type: "compare", i: j, j: j + 1, a, b, needsSwap });
      if (needsSwap) {
        steps.push({ type: "swap", i: j, j: j + 1, a, b });
        [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
      }
    }
    steps.push({ type: "mark", index: n - i - 1, value: copy[n - i - 1] });
  }
  steps.push({ type: "mark", index: 0, value: copy[0] });
  steps.push({ type: "spotlight" });
  return steps;
}
