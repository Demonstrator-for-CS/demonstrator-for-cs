import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { demoCatalog } from "../data/demoCatalog.js";

const CARD_SHIFT_REM = 18;

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const offsetsRef = useRef(new Map());

  const carouselCards = useMemo(() => {
    const total = demoCatalog.length;
    if (total === 0) return [];

    const previousOffsets = offsetsRef.current;
    const nextOffsets = new Map();

    const cards = demoCatalog.map((demo, index) => {
      const offset = resolveOffset(index, activeIndex, total, previousOffsets);
      nextOffsets.set(index, offset);
      return { demo, index, offset };
    });

    offsetsRef.current = nextOffsets;
    return cards;
  }, [activeIndex]);

  const hasMultiple = demoCatalog.length > 1;

  function cycle(direction) {
    if (!hasMultiple) return;
    const len = demoCatalog.length;
    setActiveIndex((current) =>
      direction === "next"
        ? (current + 1) % len
        : (current - 1 + len) % len,
    );
  }

  function launchDemo(demo) {
    if (!demo || demo.status !== "available") return;
    const target = demo.path || `/demos/${demo.id}`;
    navigate(target);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="z-10 flex flex-col items-center gap-3 px-6 pt-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">
          Choose a demo
        </p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          CS Demonstrator
        </h1>
        <p className="text-base text-slate-400">
          Tap a card to focus, tap again to launch the logic gates demo.
        </p>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.18)_0%,_rgba(15,23,42,0.05)_45%,_rgba(15,23,42,0.95)_100%)] blur-3xl" />

        <div className="relative flex w-full max-w-6xl items-center justify-center gap-4">
          <CarouselNavButton
            label="Previous demo"
            direction="< Prev"
            disabled={!hasMultiple}
            onClick={() => cycle("prev")}
          />

          <div className="relative flex h-[30rem] w-full flex-1 justify-center">
            {carouselCards.map(({ demo, index, offset }) => (
              <CarouselCard
                key={demo.id}
                demo={demo}
                offset={offset}
                isActive={index === activeIndex}
                onSelect={() => setActiveIndex(index)}
                onActivate={() => launchDemo(demo)}
              />
            ))}
          </div>

          <CarouselNavButton
            label="Next demo"
            direction="Next >"
            disabled={!hasMultiple}
            onClick={() => cycle("next")}
          />
        </div>
      </main>
    </div>
  );
}

function resolveOffset(index, activeIndex, length, previousOffsets) {
  const raw = index - activeIndex;
  const normalized = normalizeOffset(raw, length);

  const previous = previousOffsets.get(index);
  if (previous === undefined) return normalized;

  let best = normalized;
  let minDiff = Math.abs(normalized - previous);

  for (let k = -2; k <= 2; k += 1) {
    const candidate = normalizeOffset(raw + k * length, length);
    const diff = Math.abs(candidate - previous);
    if (diff < minDiff) {
      minDiff = diff;
      best = candidate;
    }
  }

  return best;
}

function normalizeOffset(value, length) {
  let offset = value;
  const half = length / 2;
  while (offset > half) offset -= length;
  while (offset < -half) offset += length;
  return offset;
}

function CarouselCard({ demo, offset, isActive, onSelect, onActivate }) {
  const distance = Math.abs(offset);
  const isNeighbor = distance === 1;
  const isHidden = distance >= 2;

  const translateX = `${Math.max(-2.5, Math.min(2.5, offset)) * CARD_SHIFT_REM}rem`;
  const translateY = isActive ? "0rem" : isNeighbor ? "1.5rem" : "4rem";
  const scale = isActive ? 1 : isNeighbor ? 0.88 : 0.78;
  const opacity = isHidden ? 0 : isActive ? 1 : 0.5;
  const pointerEvents = isHidden ? "none" : "auto";
  const zIndex = isActive ? 60 : isNeighbor ? 40 - distance : 5;
  const widthClass = isActive ? "w-[22rem] sm:w-[26rem] lg:w-[32rem]" : "w-36 sm:w-44 lg:w-48";
  const paddingY = isActive ? "py-14" : "py-9";

  return (
    <button
      type="button"
      onClick={() => {
        if (isActive) {
          onActivate?.();
        } else {
          onSelect();
        }
      }}
      className={`absolute left-1/2 top-0 glass-panel ${widthClass} px-8 ${paddingY} text-center text-slate-200 transition-all duration-500 ease-out ${isHidden ? "" : "cursor-pointer"}`}
      style={{
        transform: `translateX(-50%) translateX(${translateX}) translateY(${translateY}) scale(${scale})`,
        opacity,
        pointerEvents,
        zIndex,
      }}
    >
      {isActive ? (
        <>
          <h2 className="text-4xl font-semibold text-white">{demo.title}</h2>
          <span className="mt-5 block text-sm uppercase tracking-[0.35em] text-sky-300">
            Tap to launch
          </span>
        </>
      ) : (
        <>
          <span className="text-lg font-semibold text-white">
            {demo.title}
          </span>
          <span className="mt-3 block text-xs uppercase tracking-[0.3em] text-slate-400">
            Tap to focus
          </span>
        </>
      )}
    </button>
  );
}

function CarouselNavButton({ label, direction, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 items-center rounded-full border border-sky-500/40 px-6 text-sm font-semibold uppercase tracking-wider text-sky-100 transition hover:border-sky-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
    >
      {direction}
    </button>
  );
}
