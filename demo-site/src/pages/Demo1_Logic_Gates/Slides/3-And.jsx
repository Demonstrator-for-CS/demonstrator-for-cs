import { useState, useEffect } from 'react';
import simple_and from "../Images/simple_and.png"

export default function AndGate({ controllerInputA, controllerInputB }) {
    const [localInputA, setLocalInputA] = useState(false);
    const [localInputB, setLocalInputB] = useState(false);

    // Use controller input if available, otherwise use local state
    const inputA = controllerInputA !== undefined ? controllerInputA : localInputA;
    const inputB = controllerInputB !== undefined ? controllerInputB : localInputB;

    // Output Calculation
    const output = inputA && inputB;

    // keyboard inputs (TEMPORARY) - only when controller not connected
    useEffect(() => {
        if (controllerInputA !== undefined || controllerInputB !== undefined) return;

        const handleKeyPress = (e) => {
            if (e.key === '1') {
                setLocalInputA(prev => !prev);
            } else if (e.key === '2') {
                setLocalInputB(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [controllerInputA, controllerInputB]);

    return (
        <div className="flex flex-col items-center justify-center h-full px-8">
            <h2 className="text-9xl font-bold mb-8 text-blue-600">AND Gate</h2>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <p className="text-3xl mb-8 text-gray-700 text-center">
                    The AND gate outputs TRUE only when <span className="font-bold">both inputs are TRUE</span>.
                </p>

                <div className="flex gap-12 items-center justify-center">
                    {/* Gate column */}
                    <div className="flex-1 flex items-center justify-center gap-8">
                        {/* Inputs */}
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-2xl font-semibold">Input A</div>
                                <button
                                    onClick={() => controllerInputA === undefined && setLocalInputA(!localInputA)}
                                    disabled={controllerInputA !== undefined}
                                    className={`w-24 h-24 rounded-lg font-bold text-6xl transition-all ${
                                        inputA
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                            : 'bg-gray-300 text-gray-600'
                                    } ${controllerInputA !== undefined ? 'cursor-not-allowed opacity-75' : ''}`}>
                                    {inputA ? '1' : '0'}
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="text-2xl font-semibold">Input B</div>
                                <button
                                    onClick={() => controllerInputB === undefined && setLocalInputB(!localInputB)}
                                    disabled={controllerInputB !== undefined}
                                    className={`w-24 h-24 rounded-lg font-bold text-6xl transition-all ${
                                        inputB
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                            : 'bg-gray-300 text-gray-600'
                                    } ${controllerInputB !== undefined ? 'cursor-not-allowed opacity-75' : ''}`}>
                                    {inputB ? '1' : '0'}
                                </button>
                            </div>
                        </div>

                        {/* AND Gate Symbol */}
                        <div className="">
                            <img className="img-fluid" src={simple_and} alt="AND Gate"/>
                        </div>

                        {/* Output */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-2xl font-semibold">Output</div>
                            <div
                                className={`w-24 h-24 rounded-lg font-bold text-6xl flex items-center justify-center transition-all ${
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
                        <h3 className="text-4xl font-bold mb-6 text-center">Truth Table</h3>
                        <div className="grid grid-cols-3 gap-3 text-center font-mono text-lg">
                            <div className="font-bold text-3xl">A</div>
                            <div className="font-bold text-3xl">B</div>
                            <div className="font-bold text-3xl">Output</div>

                            <div className={`p-2 rounded text-5xl ${!inputA && !inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-2 rounded text-5xl ${!inputA && !inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-2 rounded text-5xl ${!inputA && !inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-red-100'}`}>0</div>

                            <div className={`p-2 rounded text-5xl ${!inputA && inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-2 rounded text-5xl ${!inputA && inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-2 rounded text-5xl ${!inputA && inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-red-100'}`}>0</div>

                            <div className={`p-2 rounded text-5xl ${inputA && !inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-2 rounded text-5xl ${inputA && !inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-2 rounded text-5xl ${inputA && !inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-red-100'}`}>0</div>

                            <div className={`p-2 rounded text-5xl ${inputA && inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-2 rounded text-5xl ${inputA && inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-2 rounded text-5xl ${inputA && inputB ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-green-100'}`}>1</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}