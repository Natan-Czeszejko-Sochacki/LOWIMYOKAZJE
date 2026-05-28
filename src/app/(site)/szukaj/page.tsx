import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { searchProducts } from "@/lib/catalog";
import { getStoreById } from "@/lib/stores";
import { formatManufacturerDisplay } from "@/lib/product-matcher";

export const dynamic = "force-dynamic";
const SEARCH_RESULTS_LIMIT = 96;

type Props = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    store?: string;
    brand?: string;
    promo?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

function parsePriceParam(value?: string): number | null {
  if (!value?.trim()) return null;
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

function parsePageNumber(value?: string): number {
  const page = Number.parseInt(value ?? "", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function getPageLinks(currentPage: number, totalPages: number): Array<number | "..."> {
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

export default async function SearchPage({ searchParams }: Props) {
  const { q, page, sort, store, brand, promo, minPrice, maxPrice } = await searchParams;
  const query = q?.trim() ?? "";
  const baseResults = query ? await searchProducts(query) : [];
  const selectedStore = store?.trim() ?? "";
  const selectedBrand = brand?.trim() ?? "";
  const minPromo = Number.parseInt(promo ?? "", 10);
  const minPromoValue = Number.isFinite(minPromo) ? minPromo : 0;
  const minPriceValue = parsePriceParam(minPrice);
  const maxPriceValue = parsePriceParam(maxPrice);
  const selectedSort = sort?.trim() || "relevance";

  const storeOptions = [...new Set(baseResults.flatMap((p) => p.offers.map((o) => o.storeId)))]
    .map((id) => ({ id, name: getStoreById(id)?.name ?? id }))
    .sort((a, b) => a.name.localeCompare(b.name, "pl"));

  const brandOptions = [...new Set(
    baseResults
      .map((p) => formatManufacturerDisplay(p.brand, p.name) ?? "")
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "pl"));

  const results = baseResults
    .filter((p) => {
      const manufacturer = formatManufacturerDisplay(p.brand, p.name) ?? "";
      if (selectedStore && !p.offers.some((o) => o.storeId === selectedStore)) return false;
      if (selectedBrand && manufacturer.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (minPromoValue > 0 && p.discountPercent < minPromoValue) return false;
      if (minPriceValue != null && (!p.bestOffer || p.bestOffer.price < minPriceValue)) return false;
      if (maxPriceValue != null && (!p.bestOffer || p.bestOffer.price > maxPriceValue)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "price-asc":
          return (a.bestOffer?.price ?? Number.POSITIVE_INFINITY) - (b.bestOffer?.price ?? Number.POSITIVE_INFINITY);
        case "price-desc":
          return (b.bestOffer?.price ?? 0) - (a.bestOffer?.price ?? 0);
        case "discount-desc":
          return b.discountPercent - a.discountPercent;
        case "stores-desc":
          return b.offers.length - a.offers.length;
        case "updated-desc":
          return (b.bestOffer?.updatedAt ?? "").localeCompare(a.bestOffer?.updatedAt ?? "");
        case "name-asc":
          return a.name.localeCompare(b.name, "pl");
        default:
          return 0;
      }
    });
  const requestedPage = parsePageNumber(page);
  const totalPages = Math.max(1, Math.ceil(results.length / SEARCH_RESULTS_LIMIT));
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * SEARCH_RESULTS_LIMIT;
  const pagedResults = results.slice(offset, offset + SEARCH_RESULTS_LIMIT);

  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedSort && selectedSort !== "relevance") params.set("sort", selectedSort);
    if (selectedStore) params.set("store", selectedStore);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (minPromoValue > 0) params.set("promo", String(minPromoValue));
    if (minPrice?.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice?.trim()) params.set("maxPrice", maxPrice.trim());
    if (targetPage > 1) params.set("page", String(targetPage));
    return `/szukaj?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Szukaj</h1>
      {query ? (
        <p className="mt-2 text-water-400">
          Wyniki dla „{query}” — {results.length} z {baseResults.length} produktów
        </p>
      ) : (
        <p className="mt-2 text-water-400">Wpisz frazę w wyszukiwarkę u góry strony.</p>
      )}

      <form action="/szukaj" method="get" className="mt-6 max-w-lg">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="np. Shimano, kołowrotek, wobbler..."
          className="w-full rounded-lg border border-water-700 bg-white px-4 py-3 text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
        />
      </form>

      <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {query && (
          <aside className="h-fit rounded-xl border border-water-700 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Sortowanie i filtry
            </h2>
            <form action="/szukaj" method="get" className="mt-4 space-y-4">
              <input type="hidden" name="q" value={query} />

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-water-500">Sortuj</span>
                <select
                  name="sort"
                  defaultValue={selectedSort}
                  className="w-full rounded-lg border border-water-700 bg-white px-3 py-2 text-foreground focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                >
                  <option value="relevance">Domyślne</option>
                  <option value="price-asc">Cena rosnąco</option>
                  <option value="price-desc">Cena malejąco</option>
                  <option value="discount-desc">Największa promocja</option>
                  <option value="stores-desc">Najwięcej sklepów</option>
                  <option value="updated-desc">Najnowsze aktualizacje</option>
                  <option value="name-asc">Nazwa A-Z</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-water-500">Sklep</span>
                <select
                  name="store"
                  defaultValue={selectedStore}
                  className="w-full rounded-lg border border-water-700 bg-white px-3 py-2 text-foreground focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                >
                  <option value="">Wszystkie</option>
                  {storeOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-water-500">Marka</span>
                <select
                  name="brand"
                  defaultValue={selectedBrand}
                  className="w-full rounded-lg border border-water-700 bg-white px-3 py-2 text-foreground focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                >
                  <option value="">Wszystkie</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-water-500">Promocja</span>
                <select
                  name="promo"
                  defaultValue={minPromoValue ? String(minPromoValue) : ""}
                  className="w-full rounded-lg border border-water-700 bg-white px-3 py-2 text-foreground focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                >
                  <option value="">Dowolna</option>
                  <option value="10">10%+</option>
                  <option value="20">20%+</option>
                  <option value="30">30%+</option>
                  <option value="40">40%+</option>
                  <option value="50">50%+</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-water-500">Cena od</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="minPrice"
                    defaultValue={minPrice ?? ""}
                    placeholder="0"
                    className="w-full rounded-lg border border-water-700 bg-white px-3 py-2 text-foreground focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-water-500">Cena do</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="maxPrice"
                    defaultValue={maxPrice ?? ""}
                    placeholder="9999"
                    className="w-full rounded-lg border border-water-700 bg-white px-3 py-2 text-foreground focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-accent-500 px-3 py-2 text-sm font-semibold text-white hover:bg-accent-400"
                >
                  Zastosuj
                </button>
                <a
                  href={`/szukaj?q=${encodeURIComponent(query)}`}
                  className="rounded-lg border border-water-700 px-3 py-2 text-sm font-medium text-water-500 hover:bg-water-900 hover:text-foreground"
                >
                  Resetuj
                </a>
              </div>
            </form>
          </aside>
        )}
        <div className="relative">
          {results.length > 0 && totalPages > 1 && (
            <div className="mb-4 flex justify-end lg:absolute lg:right-0 lg:-top-12 lg:mb-0">
              <nav className="flex flex-wrap items-center gap-2" aria-label="Paginacja wyszukiwania">
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
                    <span key={`ellipsis-${index}`} className="px-1 text-water-500">
                      ...
                    </span>
                  ) : (
                    <Link
                      key={entry}
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
            </div>
          )}
          {pagedResults.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pagedResults.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex justify-end">
                  <nav className="flex flex-wrap items-center gap-2" aria-label="Paginacja wyszukiwania dół">
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
                        <span key={`ellipsis-bottom-${index}`} className="px-1 text-water-500">
                          ...
                        </span>
                      ) : (
                        <Link
                          key={`bottom-${entry}`}
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
                </div>
              )}
            </>
          )}

          {query && results.length === 0 && (
            <p className="text-water-500">Nie znaleziono produktów.</p>
          )}
        </div>

      </div>
    </div>
  );
}
