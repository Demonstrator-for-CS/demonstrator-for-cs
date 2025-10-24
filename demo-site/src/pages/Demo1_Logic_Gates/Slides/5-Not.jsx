import { useEffect, useState } from "react";
import Not from "../Images/not_gate.png";

export default function NotGate() {
  const [input, setInput] = useState(false);
  const output = !input;

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "1") {
        setInput((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <h2 className="text-5xl font-extrabold mb-8 text-indigo-700 drop-shadow-sm">NOT Gate</h2>

      <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-200/60 border border-indigo-100 max-w-6xl w-full animate-fade-in opacity-0" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
        <p className="text-2xl mb-10 text-slate-900 font-semibold text-center">
          The NOT gate <span className="font-bold text-indigo-600">inverts the input</span>. It has only one input.
        </p>

        <div className="flex gap-12 items-center justify-center">
          <div className="flex-1 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="text-lg font-semibold text-slate-800 uppercase tracking-wide">Input</div>
              <button
                onClick={() => setInput(!input)}
                className={`w-28 h-28 rounded-2xl font-extrabold text-3xl transition-all border-4 ${
                  input ? "bg-green-500 text-white border-green-400 shadow-lg shadow-green-400/60" : "bg-slate-400 text-white border-slate-500"
                }`}
              >
                {input ? "1" : "0"}
              </button>
              <div className="text-sm font-semibold text-slate-600">Press [1]</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl font-extrabold text-indigo-600 mb-3 drop-shadow-sm">NOT</div>
              <img className="img-fluid" src={Not} alt="NOT Gate" />
            </div>

            <div className="text-5xl text-indigo-300 drop-shadow">&rarr;</div>

            <div className="flex flex-col items-center gap-3">
              <div className="text-lg font-semibold text-slate-800 uppercase tracking-wide">Output</div>
              <div className={`w-28 h-28 rounded-2xl font-extrabold text-3xl flex items-center justify-center transition-all border-4 ${
                  output ? "bg-green-500 text-white border-green-400 shadow-lg shadow-green-400/60" : "bg-slate-400 text-white border-slate-500"
                }`}>
                {output ? "1" : "0"}
              </div>
              <div className="h-6" />
            </div>
          </div>

          <div className="w-px h-96 bg-gray-300" />

          <div className="flex-1">
            <h3 className="text-3xl font-semibold text-center text-indigo-700 mb-6 drop-shadow-sm">Truth Table</h3>
            <div className="grid grid-cols-2 gap-4 text-center font-mono text-xl max-w-sm mx-auto">
              <div className="logic-truth-header">Input</div>
              <div className="logic-truth-header">Output</div>

              <div className={`logic-truth-cell ${!input ? "logic-truth-active" : "logic-truth-false"}`}>0</div>
              <div className={`logic-truth-cell ${!input ? "logic-truth-active" : "logic-truth-true"}`}>1</div>

              <div className={`logic-truth-cell ${input ? "logic-truth-active" : "logic-truth-true"}`}>1</div>
              <div className={`logic-truth-cell ${input ? "logic-truth-active" : "logic-truth-false"}`}>0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
