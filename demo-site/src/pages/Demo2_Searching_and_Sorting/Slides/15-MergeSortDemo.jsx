import MergeSortVisualizer from "@/components/MergeSortVisualizer.jsx";

export default function MergeSortDemoSlide() {
    return (
        <div className="flex flex-col items-center justify-center h-full px-6 bg-white text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Slide 15</p>
            <h2 className="text-4xl font-bold text-blue-600">Hands-on Merge Sort</h2>

            <div className="mt-8 w-full max-w-5xl">
                <MergeSortVisualizer />
            </div>
        </div>
    );
}


