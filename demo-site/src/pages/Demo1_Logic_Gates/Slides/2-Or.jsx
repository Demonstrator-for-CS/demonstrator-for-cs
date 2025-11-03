import { useState, useEffect } from 'react';
import simple_or from "../Images/simple_or.png"
import Or from "@/pages/Demo1_Logic_Gates/Images/or_gate.png";

export default function OrGate() {
    const [inputA, setInputA] = useState(false);
    const [inputB, setInputB] = useState(false);

    // Calculate output: OR gate is true when at least one input is true
    const output = inputA || inputB;

    // Handle keyboard inputs
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === '1') {
                setInputA(prev => !prev);
            } else if (e.key === '2') {
                setInputB(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full px-8">
            <h2 className="text-5xl font-bold mb-8 text-purple-600">OR Gate</h2>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <p className="text-xl mb-8 text-gray-700 text-center">
                    The OR gate outputs TRUE when <span className="font-bold">at least one input is TRUE</span>.
                </p>

                <div className="flex gap-12 items-center justify-center">
                    {/* Gate column */}
                    <div className="flex-1 flex items-center justify-center gap-8">
                        {/* Inputs */}
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-lg font-semibold">Input A</div>
                                <button
                                    onClick={() => setInputA(!inputA)}
                                    className={`w-24 h-24 rounded-lg font-bold text-2xl transition-all ${
                                        inputA
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                            : 'bg-gray-300 text-gray-600'
                                    }`}>
                                    {inputA ? '1' : '0'}
                                </button>
                                <div className="text-sm text-gray-500">Press [1]</div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="text-lg font-semibold">Input B</div>
                                <button
                                    onClick={() => setInputB(!inputB)}
                                    className={`w-24 h-24 rounded-lg font-bold text-2xl transition-all ${
                                        inputB
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                            : 'bg-gray-300 text-gray-600'
                                    }`}>
                                    {inputB ? '1' : '0'}
                                </button>
                                <div className="text-sm text-gray-500">Press [2]</div>
                            </div>
                        </div>

                        {/* OR Gate Symbol */}
                        <div className="">
                            <img className="img-fluid" src={simple_or} alt="OR Gate"/>
                        </div>

                        {/* Output */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-lg font-semibold">Output</div>
                            <div
                                className={`w-24 h-24 rounded-lg font-bold text-2xl flex items-center justify-center transition-all ${
                                    output
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                        : 'bg-gray-300 text-gray-600'
                                }`}>
                                {output ? '1' : '0'}
                            </div>
                            <div className="h-6"></div>
                        </div>
                    </div>

                    <div className="w-px h-96 bg-gray-300"></div>

                    {/* Truth Table */}
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-6 text-center">Truth Table</h3>
                        <div className="grid grid-cols-3 gap-3 text-center font-mono text-lg">
                            <div className="font-bold text-xl">A</div>
                            <div className="font-bold text-xl">B</div>
                            <div className="font-bold text-xl">Output</div>

                            <div className={`p-4 rounded ${!inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-4 rounded ${!inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-4 rounded ${!inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-red-100'}`}>0</div>

                            <div className={`p-4 rounded ${!inputA && inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-4 rounded ${!inputA && inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-4 rounded ${!inputA && inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-green-100'}`}>1</div>

                            <div className={`p-4 rounded ${inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-4 rounded ${inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-4 rounded ${inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-green-100'}`}>1</div>

                            <div className={`p-4 rounded ${inputA && inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-4 rounded ${inputA && inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-4 rounded ${inputA && inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-green-100'}`}>1</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}