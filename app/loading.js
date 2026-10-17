export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-16 px-4 animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center">
        {/* Subtle pulsing background glow */}
        <div className="w-12 h-12 rounded-full border-2 border-neutral-200 animate-spin border-t-black" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-neutral-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
