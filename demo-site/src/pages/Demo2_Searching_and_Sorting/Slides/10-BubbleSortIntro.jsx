export default function BubbleSortIntro() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-10 text-center text-slate-800">
      <p className="mt-4 text-9xl text-blue-600 font-bold">Bubble Sort</p>
      <p className="mt-10 max-w-4xl text-3xl leading-relaxed">
        Bubble sort repeatedly compares adjacent values and swaps them when they are out of order. Small values "bubble"
        toward the front, one pass at a time, until the entire list is sorted.
      </p>
    </div>
  );
}
