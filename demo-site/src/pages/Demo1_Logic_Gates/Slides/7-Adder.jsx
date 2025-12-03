import { useRef, useEffect } from 'react';

export default function OneBitAdder({ controllerInputA, controllerInputB }) {
    const iframeRef = useRef(null);

    // Send controller inputs to iframe
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'toggleInput', input: 'A', value: controllerInputA },
                '*'
            );
        }
    }, [controllerInputA]);

    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'toggleInput', input: 'B', value: controllerInputB },
                '*'
            );
        }
    }, [controllerInputB]);

    return (
        <div className="flex flex-col items-center justify-center h-full px-8 gap-4">
            <h2 className="text-5xl font-bold text-indigo-600 animate-fade-in">
                One-Bit Adder
            </h2>

            <p className="text-xl text-gray-700 text-center max-w-3xl animate-fade-in opacity-0"
               style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                Use the <span className="font-bold">A</span> and <span className="font-bold">B</span> buttons on the controller to add two binary digits
            </p>

            <div className="w-3/4 h-3/4 bg-white rounded-lg shadow-lg border-2 border-gray-200 animate-fade-in opacity-0
             flex justify-center items-center"
                 style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                <iframe
                    ref={iframeRef}
                    src="/simcirjs/adder.html"
                    className="w-full h-full rounded-lg"
                    title="One-Bit Adder Circuit"
                    style={{ border: 'none' }}
                />
            </div>
        </div>
    );
}