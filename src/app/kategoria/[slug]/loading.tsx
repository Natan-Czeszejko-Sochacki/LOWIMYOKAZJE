import { CatalogListingSkeleton } from "@/components/catalog/CatalogListingSkeleton";

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="h-10 w-10 animate-pulse rounded bg-water-800" />
      <div className="mt-2 h-9 w-64 animate-pulse rounded-lg bg-water-800" />
      <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded bg-water-800" />
      <div className="mt-10">
        <CatalogListingSkeleton count={12} />
      </div>
    </div>
  );
}
