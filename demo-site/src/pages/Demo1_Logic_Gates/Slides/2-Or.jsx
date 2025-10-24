import { useState, useEffect } from "react";
import Or from "../Images/or_gate.png";

export default function OrGate() {
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);

  const output = inputA || inputB;

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "1") {
        setInputA((prev) => !prev);
      } else if (event.key === "2") {
        setInputB((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <h2 className="text-5xl font-extrabold mb-8 text-indigo-700 drop-shadow-sm">OR Gate</h2>

      <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-200/60 border border-indigo-100 max-w-6xl w-full animate-fade-in opacity-0" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
        <p className="text-2xl mb-10 text-slate-900 font-semibold text-center">
          The OR gate outputs TRUE when <span className="font-bold">at least one input is TRUE</span>.
        </p>

        <div className="flex gap-12 items-center justify-center">
          <div className="flex-1 flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="text-lg font-semibold text-slate-800 uppercase tracking-wide">Input A</div>
              <button
                onClick={() => setInputA(!inputA)}
                className={`w-28 h-28 rounded-2xl font-extrabold text-3xl transition-all border-4 ${
                  inputA ? "bg-green-500 text-white border-green-400 shadow-lg shadow-green-400/60" : "bg-slate-400 text-white border-slate-500"
                }`}
              >
                {inputA ? "1" : "0"}
              </button>
              <div className="text-sm font-semibold text-slate-600">Press [1]</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl font-extrabold text-indigo-600 mb-3 drop-shadow-sm">OR</div>
              <img className="img-fluid" src={Or} alt="OR Gate" />
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="text-lg font-semibold text-slate-800 uppercase tracking-wide">Input B</div>
              <button
                onClick={() => setInputB(!inputB)}
                className={`w-28 h-28 rounded-2xl font-extrabold text-3xl transition-all border-4 ${
                  inputB ? "bg-green-500 text-white border-green-400 shadow-lg shadow-green-400/60" : "bg-slate-400 text-white border-slate-500"
                }`}
              >
                {inputB ? "1" : "0"}
              </button>
              <div className="text-sm font-semibold text-slate-600">Press [2]</div>
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

          <div className="w-px h-96 bg-indigo-100 hidden lg:block" />

          <div className="flex-1">
            <h3 className="text-3xl font-semibold text-center text-indigo-700 mb-6 drop-shadow-sm">Truth Table</h3>
            <div className="grid grid-cols-3 gap-4 text-center font-mono text-xl">
              <div className="logic-truth-header">A</div>
              <div className="logic-truth-header">B</div>
              <div className="logic-truth-header">Output</div>

              <div className={`logic-truth-cell ${!inputA && !inputB ? "logic-truth-active" : "logic-truth-false"}`}>0</div>
              <div className={`logic-truth-cell ${!inputA && !inputB ? "logic-truth-active" : "logic-truth-false"}`}>0</div>
              <div className={`logic-truth-cell ${!inputA && !inputB ? "logic-truth-active" : "logic-truth-false"}`}>0</div>

              <div className={`logic-truth-cell ${!inputA && inputB ? "logic-truth-active" : "logic-truth-false"}`}>0</div>
              <div className={`logic-truth-cell ${!inputA && inputB ? "logic-truth-active" : "logic-truth-true"}`}>1</div>
              <div className={`logic-truth-cell ${!inputA && inputB ? "logic-truth-active" : "logic-truth-true"}`}>1</div>

              <div className={`logic-truth-cell ${inputA && !inputB ? "logic-truth-active" : "logic-truth-true"}`}>1</div>
              <div className={`logic-truth-cell ${inputA && !inputB ? "logic-truth-active" : "logic-truth-false"}`}>0</div>
              <div className={`logic-truth-cell ${inputA && !inputB ? "logic-truth-active" : "logic-truth-true"}`}>1</div>

              <div className={`logic-truth-cell ${inputA && inputB ? "logic-truth-active" : "logic-truth-true"}`}>1</div>
              <div className={`logic-truth-cell ${inputA && inputB ? "logic-truth-active" : "logic-truth-true"}`}>1</div>
              <div className={`logic-truth-cell ${inputA && inputB ? "logic-truth-active" : "logic-truth-true"}`}>1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
