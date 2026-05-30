"use client";

import { getPageLinks } from "@/components/CatalogPagination";

type Props = {
  currentPage: number;
  totalPages: number;
  ariaLabel: string;
  className?: string;
  idSuffix?: string;
  onPageChange: (page: number) => void;
  onPagePrefetch?: (page: number) => void;
};

export function CatalogPaginationClient({
  currentPage,
  totalPages,
  ariaLabel,
  className = "",
  idSuffix = "",
  onPageChange,
  onPagePrefetch,
}: Props) {
  if (totalPages <= 1) return null;

  const btnClass = (active: boolean, disabled: boolean) =>
    `rounded-md border px-2.5 py-1.5 text-xs transition sm:px-3 sm:text-sm ${
      disabled
        ? "pointer-events-none border-water-700 text-water-500 opacity-50"
        : active
          ? "border-accent-500 bg-accent-500 text-white"
          : "border-water-700 text-foreground hover:bg-water-900"
    }`;

  return (
    <nav
        className={`flex flex-wrap items-center justify-center gap-1.5 sm:justify-end sm:gap-2 ${className}`}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        className={btnClass(false, currentPage === 1)}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Poprzednia
      </button>
      {getPageLinks(currentPage, totalPages).map((entry, index) =>
        entry === "..." ? (
          <span key={`ellipsis${idSuffix}-${index}`} className="px-1 text-water-500">
            ...
          </span>
        ) : (
          <button
            key={`page${idSuffix}-${entry}`}
            type="button"
            aria-current={entry === currentPage ? "page" : undefined}
            className={btnClass(entry === currentPage, false)}
            onClick={() => onPageChange(entry)}
            onMouseEnter={() => onPagePrefetch?.(entry)}
            onFocus={() => onPagePrefetch?.(entry)}
          >
            {entry}
          </button>
        )
      )}
      <button
        type="button"
        disabled={currentPage === totalPages}
        className={btnClass(false, currentPage === totalPages)}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Następna
      </button>
    </nav>
  );
}
