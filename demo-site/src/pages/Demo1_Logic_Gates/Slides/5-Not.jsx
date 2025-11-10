import { useState, useEffect } from 'react';
import simple_not from "../Images/simple_not.png"

export default function NotGate() {
    const [input, setInput] = useState(false);

    // Calculate output: NOT gate inverts the input
    const output = !input;

    // Handle keyboard input
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === '1') {
                setInput(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full px-8">
            <h2 className="text-9xl font-bold mb-8 text-red-600">NOT Gate</h2>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <p className="text-3xl mb-8 text-gray-700 text-center">
                    The NOT gate <span className="font-bold">inverts</span> the input. It has only one input.
                </p>

                <div className="flex gap-12 items-center justify-center">
                    {/* Gate column */}
                    <div className="flex-1 flex items-center justify-center gap-8">
                        {/* Input */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-2xl font-semibold">Input</div>
                            <button
                                onClick={() => setInput(!input)}
                                className={`w-24 h-24 rounded-lg font-bold text-6xl transition-all ${
                                    input
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                        : 'bg-gray-300 text-gray-600'
                                }`}>
                                {input ? '1' : '0'}
                            </button>
                        </div>

                        {/* NOT Gate Symbol */}
                        <div className="">
                            <img className="img-fluid" src={simple_not} alt="NOT Gate"/>
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
                        <div className="grid grid-cols-2 gap-3 text-center font-mono text-lg max-w-sm mx-auto">
                            <div className="font-bold text-3xl">Input</div>
                            <div className="font-bold text-3xl">Output</div>

                            <div className={`p-2 rounded text-5xl ${!input ? 'bg-red-200 ring-2 ring-red-500' : 'bg-red-100'}`}>0</div>
                            <div className={`p-2 rounded text-5xl ${!input ? 'bg-red-200 ring-2 ring-red-500' : 'bg-green-100'}`}>1</div>

                            <div className={`p-2 rounded text-5xl ${input ? 'bg-red-200 ring-2 ring-red-500' : 'bg-green-100'}`}>1</div>
                            <div className={`p-2 rounded text-5xl ${input ? 'bg-red-200 ring-2 ring-red-500' : 'bg-red-100'}`}>0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}