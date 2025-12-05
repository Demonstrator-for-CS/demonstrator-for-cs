import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useServerState } from "../hooks/useServerState";

const INITIAL_VALUES = [5, 4, 3, 2, 1];
const STEP_DURATION = 2800;
const PHASE_PORTION = 0.6;
const SPOTLIGHT_DURATION = 2000;
const CARD_TRAVEL = 120;
const STAGE_LIFT = -110;

export default function MergeSortVisualizer() {
  const { state } = useServerState();
  const operations = useMemo(() => generateMergeOperations([...INITIAL_VALUES]), []);
  const [values, setValues] = useState(() => [...INITIAL_VALUES]);
  const [stepIndex, setStepIndex] = useState(0);
  const [phaseStage, setPhaseStage] = useState("spotlight");
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stageOffsets, setStageOffsets] = useState({});
  const [writeOffsets, setWriteOffsets] = useState({});
  const [announcement, setAnnouncement] = useState({ text: "Tap start to watch merge sort unfold", tone: "calm" });
  const [spotlightInfo, setSpotlightInfo] = useState(null);
  const [writeContext, setWriteContext] = useState(null);
  const [finalizedSlots, setFinalizedSlots] = useState([]);

  const timersRef = useRef([]);
  const valuesRef = useRef(values);
  const prevStatusRef = useRef(state.status);

  const currentOp = operations[stepIndex] ?? null;
  const performing = phaseStage === "action" && currentOp;
  const activePair = performing && currentOp?.type === "compare" ? currentOp.indices : [];
  const activeWriteSource = writeContext?.source ?? null;
  const activeWriteTarget = writeContext?.target ?? null;

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

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
    setStageOffsets({});
    setWriteOffsets({});
    setSpotlightInfo(null);
    setWriteContext(null);
    setFinalizedSlots([]);
    setAnnouncement({ text: "Tap start to watch merge sort unfold", tone: "calm" });
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

    // Handle reset command from server (when current_slide goes to 0 and status is idle)
    if (state.status === 'playing' && (isRunning || completed)) {
      reset();
    }

    prevStatusRef.current = state.status;
  }, [state.status, state.current_slide, isRunning, completed, toggle, reset]);

  useEffect(() => {
    clearTimers();

    if (!isRunning || stepIndex >= operations.length) {
      if (isRunning && stepIndex >= operations.length && !completed) {
        setCompleted(true);
        setIsRunning(false);
        setPhaseStage("spotlight");
        setSpotlightInfo(null);
        setWriteContext(null);
        setFinalizedSlots(operations.filter((op) => op.type === "write").map((op) => op.index));
        setAnnouncement({ text: "Sorted! Merge sort finished", tone: "calm" });
      }
      return;
    }

    const op = operations[stepIndex];
    const duration = op.type === "write" ? STEP_DURATION : STEP_DURATION * PHASE_PORTION;
    const writeSource = op.type === "write" ? (typeof op.source === "number" ? op.source : op.index) : null;

    if (phaseStage === "spotlight") {
      setSpotlightInfo(getMergeSpotlight(op));
      const overlayHandle = setTimeout(() => {
        setSpotlightInfo(null);
        setPhaseStage("action");
      }, SPOTLIGHT_DURATION);
      timersRef.current.push(overlayHandle);
      return () => clearTimers();
    }

    if (op.type === "compare") {
      const [leftIdx, rightIdx] = op.indices;
      setStageOffsets({
        [leftIdx]: { x: -70, y: STAGE_LIFT },
        [rightIdx]: { x: 70, y: STAGE_LIFT },
      });
      setAnnouncement({ text: `Compare ${op.leftValue} and ${op.rightValue}`, tone: "alert" });
      const calmHandle = setTimeout(() => {
        setAnnouncement((prev) => ({ ...prev, tone: "calm" }));
      }, duration * 0.7);
      timersRef.current.push(calmHandle);
      setWriteContext(null);
    } else {
      setStageOffsets({});
    }

    if (writeSource !== null) {
      setAnnouncement({ text: `Place ${op.value} into slot ${op.index + 1}`, tone: "alert" });
      const displacedValue = valuesRef.current[op.index];
      setWriteContext({ source: writeSource, target: op.index, value: op.value, displacedValue, inserted: false });
      setWriteOffsets({
        [writeSource]: {
          x: 0,
          y: STAGE_LIFT,
        },
      });

      const glideHandle = setTimeout(() => {
        setWriteOffsets((prev) => ({
          ...prev,
          [writeSource]: {
            x: (op.index - writeSource) * CARD_TRAVEL,
            y: STAGE_LIFT,
          },
        }));
      }, duration * 0.35);
      timersRef.current.push(glideHandle);

      const dropHandle = setTimeout(() => {
        setWriteOffsets((prev) => {
          const current = prev[writeSource];
          if (!current) return prev;
          return {
            ...prev,
            [writeSource]: {
              ...current,
              y: 0,
            },
          };
        });
      }, duration * 0.65);
      timersRef.current.push(dropHandle);

      const settleHandle = setTimeout(() => {
        setWriteContext((prev) => {
          if (!prev || prev.source !== writeSource) return prev;
          return { ...prev, inserted: true };
        });
        setValues((prev) => {
          const next = [...prev];
          next[op.index] = op.value;
          return next;
        });
      }, duration * 0.8);
      timersRef.current.push(settleHandle);

      const finalizeHandle = setTimeout(() => {
        if (op.isFinal) {
          setFinalizedSlots((prev) => (prev.includes(op.index) ? prev : [...prev, op.index]));
        }
      }, duration * 0.95);
      timersRef.current.push(finalizeHandle);

      const calmHandle = setTimeout(() => {
        setAnnouncement((prev) => ({ ...prev, tone: "calm" }));
      }, duration * 0.65);
      timersRef.current.push(calmHandle);
    } else if (op.type !== "compare") {
      setWriteContext(null);
    }

    if (op.type === "complete") {
      setAnnouncement({ text: "Sorted! Merge sort finished", tone: "calm" });
    }

    const advanceHandle = setTimeout(() => {
      if (writeSource !== null) {
        setWriteOffsets((prev) => {
          if (!(writeSource in prev)) return prev;
          const next = { ...prev };
          delete next[writeSource];
          return next;
        });
        setWriteContext(null);
      }
      setPhaseStage("spotlight");
      setStepIndex((prev) => prev + 1);
    }, duration);

    timersRef.current.push(advanceHandle);

    return () => clearTimers();
  }, [isRunning, stepIndex, operations, phaseStage, clearTimers, completed]);

  return (
    <div className="relative w-full rounded-[32px] border border-slate-200 bg-white px-16 pt-36 pb-16 text-slate-900 shadow-2xl overflow-hidden min-h-[40rem]">
      <AnimatePresence>
        {spotlightInfo && (
          <motion.div
            key="merge-spotlight"
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
                    key={`${value}-${idx}-merge-spotlight`}
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-48 w-32 items-center justify-center rounded-[2.75rem] border-4 border-sky-400 bg-white text-7xl font-black text-slate-800 shadow-2xl sm:w-36"
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
              className="px-4 text-center text-4xl font-black uppercase tracking-[0.35em] text-rose-400 sm:text-4xl"
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
            const isCompare = activePair.includes(index);
            const isMovingCard = activeWriteSource === index;
            const showMovingCard = isMovingCard && writeContext && !writeContext.inserted;
            const isIncomingSlot = activeWriteTarget === index && writeContext && !writeContext.inserted;
            const stage = stageOffsets[index] || { x: 0, y: 0 };
            const travel = writeOffsets[index] || { x: 0, y: 0 };
            const baseElevation = showMovingCard ? -30 : isCompare ? -20 : 0;
            const finalY = baseElevation + stage.y + travel.y;
            const finalX = stage.x + travel.x;
            const scale = showMovingCard ? 1.12 : isCompare ? 1.08 : 1;
            const isFinalized =
              finalizedSlots.includes(index) &&
              !showMovingCard &&
              !(writeContext && writeContext.target === index && !writeContext.inserted);
            const glow = isFinalized
              ? "0px 0px 35px rgba(16,185,129,0.45)"
              : showMovingCard
                ? "0px 0px 55px rgba(14,165,233,0.45)"
                : isCompare
                  ? "0px 0px 35px rgba(14,165,233,0.35)"
                  : isIncomingSlot
                    ? "0px 0px 35px rgba(234,179,8,0.35)"
                    : "0px 0px 0px rgba(15,23,42,0)";

            const placeholderActive = isIncomingSlot;
            const displacedValue = placeholderActive ? writeContext?.displacedValue : null;
            const borderClass = isFinalized
              ? "border-emerald-400 bg-emerald-500/15 text-emerald-600"
              : showMovingCard
                ? "border-sky-400 bg-sky-50 text-slate-900"
                : placeholderActive
                  ? "border-transparent bg-transparent"
                  : isCompare
                    ? "border-sky-400 bg-sky-50 text-slate-900"
                    : "border-slate-300 bg-slate-50 text-slate-700";

            const displayValue = placeholderActive
              ? ""
              : showMovingCard && writeContext
                ? writeContext.value
                : value;

            // hide the moving card once inserted so it doesn't sit on top of the slot
            if (isMovingCard && writeContext && writeContext.inserted) {
              return (
                <div key={`slot-${index}`} className="flex flex-col items-center gap-3">
                  <motion.div
                    layout
                    transition={{
                      layout: { type: "spring", stiffness: 380, damping: 30 },
                      y: { type: "spring", stiffness: 320, damping: 24 },
                      x: { type: "spring", stiffness: 280, damping: 28 },
                    }}
                    animate={{ y: stage.y, x: stage.x, scale: 1, boxShadow: glow }}
                    className={`relative flex h-40 w-28 items-center justify-center overflow-visible rounded-[2.75rem] border-4 text-7xl font-black tracking-wide ${isFinalized ? "border-emerald-400 bg-emerald-500/15 text-emerald-600" : "border-slate-300 bg-slate-50 text-slate-700"}`}
                  >
                    <span className="relative z-20">{value}</span>
                  </motion.div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Slot {index + 1}</span>
                </div>
              );
            }

            return (
              <div key={`slot-${index}`} className="flex flex-col items-center gap-3">
                <motion.div
                  layout
                  transition={{
                    layout: { type: "spring", stiffness: 380, damping: 30 },
                    y: { type: "spring", stiffness: 320, damping: 24 },
                    x: { type: "spring", stiffness: 280, damping: 28 },
                  }}
                  animate={{ y: finalY, x: finalX, scale, boxShadow: glow }}
                  className={`relative flex h-40 w-28 items-center justify-center overflow-visible rounded-[2.75rem] border-4 text-7xl font-black tracking-wide ${borderClass}`}
                >
                  <AnimatePresence>
                    {placeholderActive && (
                      <motion.div
                        key={`placeholder-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0 z-0 flex items-center justify-center rounded-[2.75rem] border-4 border-dashed border-amber-400 bg-amber-50/60"
                      />
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {placeholderActive && displacedValue !== undefined && (
                      <motion.div
                        key={`displaced-${index}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 0.85, y: -14 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.35 }}
                        className="absolute left-1/2 top-0 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-full items-center justify-center rounded-3xl border-2 border-slate-300 bg-white text-4xl font-bold text-slate-400 shadow-lg"
                      >
                        {displacedValue}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="relative z-20">{displayValue}</span>
                </motion.div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Slot {index + 1}</span>
              </div>
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

        <div className="hidden flex-wrap itemscenter justify-center gap-4">
          <button type="button" onClick={toggle} className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-sky-400">
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

        <div className="mt-4 text-center text-2xl font-semibold text-slate-700">
          Time Complexity: <span className="text-blue-600">O(n log n)</span> &nbsp;|&nbsp; Space: <span className="text-blue-600">O(n)</span>
        </div>
      </motion.div>
    </div>
  );
}

function generateMergeOperations(numbers) {
  const arr = [...numbers];
  const aux = Array(arr.length);
  const ops = [];
  const totalLength = numbers.length;

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
    const isFinalSegment = lo === 0 && hi === totalLength - 1;

    for (let k = lo; k <= hi; k += 1) {
      if (i > mid) {
        ops.push({ type: "write", index: k, value: aux[j], source: j, isFinal: isFinalSegment });
        arr[k] = aux[j];
        j += 1;
      } else if (j > hi) {
        ops.push({ type: "write", index: k, value: aux[i], source: i, isFinal: isFinalSegment });
        arr[k] = aux[i];
        i += 1;
      } else {
        ops.push({ type: "compare", indices: [i, j], leftValue: aux[i], rightValue: aux[j] });
        if (aux[i] <= aux[j]) {
          ops.push({ type: "write", index: k, value: aux[i], source: i, isFinal: isFinalSegment });
          arr[k] = aux[i];
          i += 1;
        } else {
          ops.push({ type: "write", index: k, value: aux[j], source: j, isFinal: isFinalSegment });
          arr[k] = aux[j];
          j += 1;
        }
      }
    }
  }

  mergeSort(0, arr.length - 1);
  ops.push({ type: "complete", values: [...arr] });
  return ops;
}

function getMergeSpotlight(op) {
  if (!op) return null;

  if (op.type === "compare") {
    return { values: [op.leftValue, op.rightValue], text: `Compare ${op.leftValue} and ${op.rightValue}` };
  }

  if (op.type === "write") {
    return { values: [op.value], text: `Place ${op.value} into slot ${op.index + 1}` };
  }

  if (op.type === "complete") {
    return { values: op.values ?? [], text: "Sorted! Merge sort finished" };
  }

  return { values: [], text: "Next merge step" };
}
