export default function MergeSortIntro() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-white text-slate-800">
            <h1 className="text-8xl font-bold mb-6 text-blue-600">Merge Sort</h1>
            <p className="text-2xl text-gray-700 max-w-3xl">
                Merge sort uses a divide-and-conquer strategy: split the list into halves, sort each half, then merge the sorted halves back together.
            </p>
        </div>
    );
}
