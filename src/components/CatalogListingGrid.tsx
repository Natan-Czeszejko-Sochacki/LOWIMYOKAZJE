import type { ReactNode } from "react";

type Props = {
  sidebar?: ReactNode;
  topPagination?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const catalogProductGridClassName =
  "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4";

/** Sidebar filtrów + kolumna produktów wyrównane od góry (paginacja nie przesuwa siatki). */
export function CatalogListingGrid({
  sidebar,
  topPagination,
  children,
  className = "",
}: Props) {
  return (
    <div
        className={`mt-6 grid gap-6 sm:mt-10 sm:gap-8 lg:items-start ${
        sidebar ? "lg:grid-cols-[18rem_minmax(0,1fr)]" : ""
      } ${className}`}
    >
      {sidebar}
      <div className="relative min-w-0">
        {topPagination ? (
          <div className="mb-4 flex justify-end lg:absolute lg:right-0 lg:bottom-full lg:mb-2">
            {topPagination}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
