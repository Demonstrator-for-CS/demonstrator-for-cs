import React, { useEffect, useState } from "react";

const BACKEND = "https://demonstrator-v1-0.onrender.com/";

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
    let t;
    async function poll() {
      try {
        const r = await fetch(`${BACKEND}/api/status?demo=${demoId}`);
        const j = await r.json();
        setState(j.state || "—");
      } catch { /* empty */ }
      t = setTimeout(poll, 1000);
    }
    poll();
    return () => clearTimeout(t);
  }, [demoId]);

  return (
    <div>
      <div>
        <button onClick={() => post("/api/start", { demo: demoId })}>Start</button>
        <button onClick={() => post("/api/pause", { demo: demoId })}>Pause</button>
        <button onClick={() => post("/api/reset", { demo: demoId })}>Reset</button>
      </div>

      <label>
        Speed (ms):{" "}
        <input
          type="range"
          min="5"
          max="250"
          value={speed}
          onChange={async (e) => {
            const v = Number(e.target.value);
            setSpeed(v);
            await post("/api/speed", { demo: demoId, value: v });
          }}
        />
        <span> {speed}</span>
      </label>

      <div>
        <strong>State: </strong>{state}
      </div>
    </div>
  );
}

