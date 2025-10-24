import React from "react";
import Controls from "./Controls.jsx";

export default function DemoSection({ title, demoId }) {
  return (
    <section className="glass-panel w-full px-8 py-10 text-left text-slate-100">
      <header>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Stage
          </h3>

          <div className="flex h-[22rem] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 text-slate-500">
            <span>Nothing yert</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Controls
          </h3>
          <Controls demoId={demoId} />
        </div>
      </div>
    </section>
  );
}
