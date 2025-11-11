const steps = [
    "Split the list into two halves until each piece has one element.",
    "Compare the smallest elements of each half while merging.",
    "Build a new sorted list by taking the smaller element at each comparison.",
    "Repeat merging until only one sorted list remains.",
];

export default function MergeSortFlow() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-white text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Slide 14</p>
            <h2 className="text-4xl font-bold mb-8 text-blue-600">Divide and Conquer</h2>
            <ul className="max-w-3xl space-y-4 text-left">
                {steps.map((text, idx) => (
                    <li key={idx} className="rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 text-lg shadow-sm">
                        <span className="font-semibold text-blue-500 mr-3">{idx + 1}.</span>
                        {text}
                    </li>
                ))}
            </ul>
        </div>
    );
}
