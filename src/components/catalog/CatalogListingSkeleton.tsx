import { catalogProductGridClassName } from "@/components/CatalogListingGrid";

export function CatalogListingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={catalogProductGridClassName} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-water-700 bg-white p-4"
        >
          <div className="mb-3 h-36 rounded-lg bg-water-800" />
          <div className="h-3 w-1/3 rounded bg-water-800" />
          <div className="mt-2 h-4 w-full rounded bg-water-800" />
          <div className="mt-4 h-8 w-1/2 rounded bg-water-800" />
        </div>
      ))}
    </div>
  );
}
