import combining_gates from "../Images/combining-gates.png"

export default function CombiningGates() {
    return (
        <div className="flex flex-col items-center justify-center h-full px-8 gap-12">
            <h2 className="text-9xl font-bold text-indigo-600 animate-fade-in">
                Combining Gates
            </h2>

            <p className="text-2xl text-gray-700 text-center max-w-4xl animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                Gates can be <span className="font-bold text-indigo-600">combined with wires</span> and other gates to create more <span className="font-bold">complex circuitry</span>.
            </p>

            <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                <img
                    className="max-w-lg w-full rounded-lg shadow-lg"
                    src={combining_gates}
                    alt="Example of combined logic gates"
                />
            </div>

            <p className="text-2xl text-gray-600 text-center max-w-3xl animate-fade-in opacity-0" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
                By connecting outputs of one gate to inputs of another, we can build circuits that perform sophisticated operations.
            </p>

            <p className="text-2xl text-gray-600 text-center max-w-3xl animate-fade-in opacity-0" style={{ animationDelay: '3.0s', animationFillMode: 'forwards' }}>
                For example, we can create an adder that adds two bits together
            </p>
        </div>
    );
}