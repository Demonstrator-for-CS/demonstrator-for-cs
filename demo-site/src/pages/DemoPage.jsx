import React from "react";
import { useNavigate, useParams } from "react-router";
import DemoSection from "../components/DemoSection.jsx";
import { getDemoById } from "../data/demoCatalog.js";

export default function DemoPage() {
  const { demoId } = useParams();
  const navigate = useNavigate();
  const demo = getDemoById(demoId);

  function goHome() {
    navigate("/");
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      goHome();
    }
  }

  if (!demo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-slate-100">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">
          Unknown demo
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          We can&apos;t find that demo.
        </h1>
        <button
          type="button"
          onClick={goHome}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-400"
        >
          Return home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-300 transition hover:text-white"
        >
          {"<"} Back
        </button>

        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">
            Demo
          </p>
          <h1 className="text-4xl font-semibold text-white">{demo.title}</h1>
        </header>

        <DemoSection title={demo.title} demoId={demo.id} />
      </div>
    </div>
  );
}
