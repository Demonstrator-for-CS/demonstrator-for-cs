export default function SelectionSortIntro() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-10 text-center text-slate-800">
      <p className="mt-4 text-9xl text-blue-600 font-bold">Selection Sort</p>
      <p className="mt-10 max-w-4xl text-3xl leading-relaxed">
        Selection sort repeatedly finds the smallest remaining element and swaps it into the next position on the left,
        shrinking the unsorted region one slot at a time until the list is sorted.
      </p>
    </div>
  );
}
