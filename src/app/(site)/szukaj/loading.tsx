import { CatalogListingSkeleton } from "@/components/catalog/CatalogListingSkeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="h-9 w-32 animate-pulse rounded-lg bg-water-800" />
      <div className="mt-4 h-5 w-2/3 max-w-md animate-pulse rounded bg-water-800" />
      <div className="mt-10">
        <CatalogListingSkeleton count={12} />
      </div>
    </div>
  );
}
