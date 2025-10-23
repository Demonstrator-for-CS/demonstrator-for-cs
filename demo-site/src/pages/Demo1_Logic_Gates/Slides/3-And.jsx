import { useState, useEffect } from 'react';

export default function AndGate() {
    const [inputA, setInputA] = useState(false);
    const [inputB, setInputB] = useState(false);

    // Calculate output: AND gate is true when both inputs are true
    const output = inputA && inputB;

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
            <h2 className="text-5xl font-bold mb-8 text-purple-600">AND Gate</h2>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full">
                <p className="text-xl mb-8 text-gray-700 text-center">
                    The AND gate outputs TRUE only when <span className="font-bold">both inputs are TRUE</span>.
                </p>

                <div className="flex gap-12 items-center justify-center">
                    {/* Gate Column */}
                    <div className="flex-1 flex items-center justify-center gap-6">
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

                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">AND</div>
                            <div className="text-5xl text-purple-600">→</div>
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

                        <div className="text-5xl text-gray-400">→</div>

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
                            <div className={`p-4 rounded ${!inputA && inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-red-100'}`}>0</div>

                            <div className={`p-4 rounded ${inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-4 rounded ${inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-4 rounded ${inputA && !inputB ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-red-100'}`}>0</div>

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