// Skeleton shown while a product that was added after the last build renders
// for the first time. Known products are prerendered and never show it.
export default function ProductLoading() {
  return (
    <div aria-busy="true" className="shell animate-pulse pb-16 pt-32 sm:pt-36 lg:pt-44">
      <div className="h-4 w-48 rounded bg-line" />
      <div className="mt-6 h-12 w-full max-w-xl rounded-lg bg-line" />
      <div className="mt-4 h-5 w-full max-w-md rounded bg-line" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
        <div className="aspect-[4/3] rounded-[var(--radius-frame)] bg-line" />
        <div className="h-80 rounded-[var(--radius-frame)] bg-line" />
      </div>
    </div>
  );
}
