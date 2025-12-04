import SelectionSortVisualizer from "@/components/SelectionSortVisualizer.jsx";

export default function SelectionSortDemoSlide() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-6 text-slate-800">
      <h2 className="mt-4 text-9xl font-bold text-blue-600">Selection Sort</h2>
      <div className="mt-8 w-full max-w-5xl">
        <SelectionSortVisualizer />
      </div>
    </div>
  );
}
