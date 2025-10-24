import React, { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export default function Controls({ demoId }) {
  const [speed, setSpeed] = useState(60);
  const [state, setState] = useState("Idle");

  async function post(path, body) {
    await fetch(`${BACKEND}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  }

  useEffect(() => {
    let timer;
    async function poll() {
      try {
        const response = await fetch(`${BACKEND}/api/status?demo=${demoId}`);
        const payload = await response.json();
        setState(payload.state || "Unknown");
      } catch {
        setState("Offline");
      }
      timer = setTimeout(poll, 1000);
    }

    poll();
    return () => clearTimeout(timer);
  }, [demoId]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-slate-200 shadow-inner shadow-black/30">
      <div className="flex flex-wrap items-center gap-3">
        <ControlButton onClick={() => post("/api/start", { demo: demoId })}>
          Start
        </ControlButton>
        <ControlButton onClick={() => post("/api/pause", { demo: demoId })}>
          Pause
        </ControlButton>
        <ControlButton onClick={() => post("/api/reset", { demo: demoId })}>
          Reset
        </ControlButton>
      </div>

      <label className="mt-6 block text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
        Speed {speed} ms
        <input
          type="range"
          min="5"
          max="250"
          value={speed}
          onChange={async (event) => {
            const value = Number(event.target.value);
            setSpeed(value);
            await post("/api/speed", { demo: demoId, value });
          }}
          className="mt-3 w-full accent-sky-500"
        />
      </label>

      <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
          State
        </span>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-base font-semibold text-white">
          {state}
        </span>
      </div>
    </div>
  );
}

function ControlButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 active:translate-y-0.5"
    >
      {children}
    </button>
  );
}
