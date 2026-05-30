export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 h-4 w-48 animate-pulse rounded bg-water-800" />
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="aspect-square max-h-[420px] animate-pulse rounded-xl bg-water-800" />
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-water-800" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-water-800" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-water-800" />
        </div>
      </div>
    </div>
  );
}
