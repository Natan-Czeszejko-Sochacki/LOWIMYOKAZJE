import Link from "next/link";

export function getPageLinks(
  currentPage: number,
  totalPages: number
): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    if (p > 1 && p < totalPages) pages.add(p);
  }
  if (currentPage <= 3) pages.add(2);
  if (currentPage >= totalPages - 2) pages.add(totalPages - 1);

  const sortedPages = [...pages].sort((a, b) => a - b);
  const links: Array<number | "..."> = [];
  for (let i = 0; i < sortedPages.length; i++) {
    const page = sortedPages[i];
    const prev = sortedPages[i - 1];
    if (prev != null && page - prev > 1) links.push("...");
    links.push(page);
  }
  return links;
}

type Props = {
  currentPage: number;
  totalPages: number;
  pageHref: (page: number) => string;
  ariaLabel: string;
  className?: string;
  idSuffix?: string;
};

export function CatalogPagination({
  currentPage,
  totalPages,
  pageHref,
  ariaLabel,
  className = "",
  idSuffix = "",
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className={`flex flex-wrap items-center justify-end gap-2 ${className}`}
      aria-label={ariaLabel}
    >
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        className={`rounded-md border px-3 py-1.5 text-sm transition ${
          currentPage === 1
            ? "pointer-events-none border-water-700 text-water-500 opacity-50"
            : "border-water-700 text-foreground hover:bg-water-900"
        }`}
        aria-disabled={currentPage === 1}
      >
        Poprzednia
      </Link>
      {getPageLinks(currentPage, totalPages).map((entry, index) =>
        entry === "..." ? (
          <span key={`ellipsis${idSuffix}-${index}`} className="px-1 text-water-500">
            ...
          </span>
        ) : (
          <Link
            key={`page${idSuffix}-${entry}`}
            href={pageHref(entry)}
            aria-current={entry === currentPage ? "page" : undefined}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              entry === currentPage
                ? "border-accent-500 bg-accent-500 text-white"
                : "border-water-700 text-foreground hover:bg-water-900"
            }`}
          >
            {entry}
          </Link>
        )
      )}
      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        className={`rounded-md border px-3 py-1.5 text-sm transition ${
          currentPage === totalPages
            ? "pointer-events-none border-water-700 text-water-500 opacity-50"
            : "border-water-700 text-foreground hover:bg-water-900"
        }`}
        aria-disabled={currentPage === totalPages}
      >
        Następna
      </Link>
    </nav>
  );
}
