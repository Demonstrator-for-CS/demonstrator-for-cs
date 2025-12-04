const steps = [
    "Split the list into two halves until each piece has one element.",
    "Compare the smallest elements of each half while merging.",
    "Build a new sorted list by taking the smaller element at each comparison.",
    "Repeat merging until only one sorted list remains.",
];

export default function MergeSortFlow() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-10 bg-white text-slate-800">
            <h2 className="text-9xl font-bold mb-8 text-blue-600">Divide and Conquer</h2>
            <ul className="max-w-4xl space-y-6 text-left">
                {steps.map((text, idx) => (
                    <li key={idx} className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 text-2xl shadow-sm">
                        <span className="font-semibold text-blue-500 mr-3 text-3xl align-middle">{idx + 1}.</span>
                        {text}
                    </li>
                ))}
            </ul>
        </div>
    );
}
