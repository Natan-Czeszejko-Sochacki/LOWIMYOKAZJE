"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import {
  CatalogListingGrid,
  catalogProductGridClassName,
} from "@/components/CatalogListingGrid";
import { ProductCard } from "@/components/ProductCard";
import { categoryPagePath } from "@/lib/catalog-params";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/search-constants";
import { CatalogListingSkeleton } from "./CatalogListingSkeleton";
import { CatalogPaginationClient } from "./CatalogPaginationClient";
import {
  catalogApiUrl,
  fetchCatalogFacets,
  fetchCatalogListing,
  prefetchCatalogListing,
} from "./catalog-fetch";
import type { CatalogListingView } from "./listing-types";

type Props = {
  mode: "search" | "category";
  categorySlug?: string;
  categoryName?: string;
  queryLabel: string;
  initialView: CatalogListingView;
  /** Query string bez leading `?` */
  initialQueryString: string;
  showInlineSearch?: boolean;
};

function parseParams(qs: string): URLSearchParams {
  return new URLSearchParams(qs);
}

export function CatalogListingClient({
  mode,
  categorySlug,
  categoryName,
  queryLabel,
  initialView,
  initialQueryString,
  showInlineSearch = mode === "search",
}: Props) {
  const [view, setView] = useState(initialView);
  const [params, setParams] = useState(() => parseParams(initialQueryString));
  const [pending, startTransition] = useTransition();
  const [facetsLoading, setFacetsLoading] = useState(
    initialView.storeOptions.length === 0 && initialView.brandOptions.length === 0
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setView(initialView);
    setParams(parseParams(initialQueryString));
  }, [initialView, initialQueryString]);

  const buildBrowserPath = useCallback(
    (next: URLSearchParams) => {
      if (mode === "search") {
        const qs = next.toString();
        return qs ? `/szukaj?${qs}` : "/szukaj";
      }
      return categoryPagePath(categorySlug ?? "", next);
    },
    [mode, categorySlug]
  );

  const loadListing = useCallback(
    (next: URLSearchParams, opts?: { pushHistory?: boolean }) => {
      const apiUrl = catalogApiUrl(mode, categorySlug, next, { includeFacets: false });
      startTransition(async () => {
        try {
          const data = await fetchCatalogListing(apiUrl);
          setView(data);
          setParams(next);
          if (opts?.pushHistory !== false) {
            window.history.replaceState(null, "", buildBrowserPath(next));
          }
        } catch {
          /* zostaw poprzedni widok */
        }
      });
    },
    [mode, categorySlug, buildBrowserPath]
  );

  useEffect(() => {
    if (mode === "search" && !params.get("q")?.trim()) return;
    let cancelled = false;
    setFacetsLoading(true);
    void fetchCatalogFacets(mode, categorySlug, params)
      .then((facets) => {
        if (!cancelled) {
          setView((v) => ({
            ...v,
            storeOptions: facets.storeOptions,
            brandOptions: facets.brandOptions,
          }));
        }
      })
      .finally(() => {
        if (!cancelled) setFacetsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, categorySlug, params.toString()]);

  useEffect(() => {
    const onPopState = () => {
      const next = new URLSearchParams(window.location.search);
      loadListing(next, { pushHistory: false });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [loadListing]);

  const pageHref = useCallback(
    (page: number) => {
      const next = new URLSearchParams(params);
      if (page > 1) next.set("page", String(page));
      else next.delete("page");
      return buildBrowserPath(next);
    },
    [params, buildBrowserPath]
  );

  const onPageChange = (page: number) => {
    const next = new URLSearchParams(params);
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    loadListing(next);
  };

  const onPagePrefetch = (page: number) => {
    const next = new URLSearchParams(params);
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    prefetchCatalogListing(
      catalogApiUrl(mode, categorySlug, next, { includeFacets: false })
    );
  };

  const onFiltersSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    if (mode === "search") {
      const q = String(fd.get("q") ?? params.get("q") ?? "").trim();
      if (q) next.set("q", q);
    } else {
      const q = String(fd.get("q") ?? "").trim();
      if (q) next.set("q", q);
    }
    const sort = String(fd.get("sort") ?? "");
    if (sort && sort !== "relevance") next.set("sort", sort);
    const store = String(fd.get("store") ?? "").trim();
    if (store) next.set("store", store);
    const brand = String(fd.get("brand") ?? "").trim();
    if (brand) next.set("brand", brand);
    const promo = String(fd.get("promo") ?? "").trim();
    if (promo) next.set("promo", promo);
    const minPrice = String(fd.get("minPrice") ?? "").trim();
    if (minPrice) next.set("minPrice", minPrice);
    const maxPrice = String(fd.get("maxPrice") ?? "").trim();
    if (maxPrice) next.set("maxPrice", maxPrice);
    loadListing(next);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setFiltersOpen(false);
    }
  };

  const selectedStore = params.get("store") ?? "";
  const selectedBrand = params.get("brand") ?? "";
  const selectedSort = params.get("sort") || "relevance";
  const minPromoValue = Number.parseInt(params.get("promo") ?? "", 10) || 0;
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";
  const query = params.get("q") ?? "";

  const countLabel = useMemo(() => {
    if (view.tooShort) {
      return `Wpisz co najmniej ${MIN_SEARCH_QUERY_LENGTH} znaki (masz ${query.length}).`;
    }
    if (view.totalFiltered === view.totalPool) {
      return `${view.totalPool} produktów`;
    }
    return `${view.totalFiltered} z ${view.totalPool} produktów`;
  }, [view, query.length]);

  const resetHref =
    mode === "search"
      ? `/szukaj?q=${encodeURIComponent(query)}`
      : categoryPagePath(categorySlug ?? "", new URLSearchParams(query ? { q: query } : {}));

  const formAction = mode === "search" ? "/szukaj" : categoryPagePath(categorySlug ?? "", new URLSearchParams());

  const isLoading = pending;

  return (
    <>
      {showInlineSearch && mode === "search" && (
        <form
          action={formAction}
          method="get"
          className="mt-6 max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const q = String(fd.get("q") ?? "").trim();
            if (q.length < MIN_SEARCH_QUERY_LENGTH) return;
            const next = new URLSearchParams({ q });
            loadListing(next);
          }}
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            minLength={MIN_SEARCH_QUERY_LENGTH}
            placeholder="np. Shimano, kołowrotek, wobbler…"
            className="w-full rounded-lg border border-water-700 bg-white px-4 py-3 text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
          />
        </form>
      )}

      {mode === "category" && categoryName && (
        <form
          action={formAction}
          method="get"
          className="mt-4 max-w-2xl"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const next = new URLSearchParams(params);
            const q = String(fd.get("q") ?? "").trim();
            if (q) next.set("q", q);
            else next.delete("q");
            next.delete("page");
            loadListing(next);
          }}
        >
          {selectedSort !== "relevance" && (
            <input type="hidden" name="sort" value={selectedSort} />
          )}
          {selectedStore && <input type="hidden" name="store" value={selectedStore} />}
          {selectedBrand && <input type="hidden" name="brand" value={selectedBrand} />}
          {minPromoValue > 0 && <input type="hidden" name="promo" value={String(minPromoValue)} />}
          {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
          {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
          <div className="relative">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={`Szukaj po nazwie w „${categoryName}"…`}
              className="w-full rounded-xl border border-water-700 bg-white py-3 pl-11 pr-24 text-foreground shadow-sm placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 sm:py-3.5"
            />
            <span
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-water-500"
              aria-hidden
            >
              🔍
            </span>
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-400"
            >
              Szukaj
            </button>
          </div>
        </form>
      )}

      <p className="mt-2 text-water-400">
        {queryLabel}
        {!view.tooShort && (
          <>
            {" "}
            — {countLabel}
          </>
        )}
      </p>
      {view.tooShort && <p className="mt-1 text-water-400">{countLabel}</p>}

      <CatalogListingGrid
        className={isLoading ? "opacity-60 transition-opacity" : undefined}
        topPagination={
          view.products.length > 0 ? (
            <CatalogPaginationClient
              currentPage={view.currentPage}
              totalPages={view.totalPages}
              ariaLabel={mode === "search" ? "Paginacja wyszukiwania" : "Paginacja kategorii"}
              onPageChange={onPageChange}
              onPagePrefetch={onPagePrefetch}
            />
          ) : undefined
        }
        sidebar={
          !view.tooShort ? (
            <>
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-water-700 bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-sm lg:hidden"
                aria-expanded={filtersOpen}
              >
                Sortowanie i filtry
                <span aria-hidden className="text-water-500">
                  {filtersOpen ? "▲" : "▼"}
                </span>
              </button>
              <aside
                className={`h-fit rounded-xl border border-water-700 bg-white p-4 shadow-sm lg:sticky lg:top-24 ${
                  filtersOpen ? "block" : "hidden lg:block"
                }`}
              >
              <h2 className="hidden text-sm font-semibold uppercase tracking-wide text-foreground lg:block">
                Sortowanie i filtry
                {facetsLoading ? (
                  <span className="ml-2 text-xs font-normal normal-case text-water-500">
                    …
                  </span>
                ) : null}
              </h2>
              <form
                action={formAction}
                method="get"
                className="mt-4 space-y-4"
                onSubmit={onFiltersSubmit}
              >
                {mode === "search" && query && (
                  <input type="hidden" name="q" value={query} />
                )}
                {mode === "category" && query && (
                  <input type="hidden" name="q" value={query} />
                )}

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
                    disabled={facetsLoading && view.storeOptions.length === 0}
                    className="w-full rounded-lg border border-water-700 bg-white px-3 py-2 text-foreground focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  >
                    <option value="">Wszystkie</option>
                    {view.storeOptions.map((s) => (
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
                    disabled={facetsLoading && view.brandOptions.length === 0}
                    className="w-full rounded-lg border border-water-700 bg-white px-3 py-2 text-foreground focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  >
                    <option value="">Wszystkie</option>
                    {view.brandOptions.map((b) => (
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
                      defaultValue={minPrice}
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
                      defaultValue={maxPrice}
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
                    href={resetHref}
                    className="rounded-lg border border-water-700 px-3 py-2 text-sm font-medium text-water-500 hover:bg-water-900 hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      const next =
                        mode === "search"
                          ? new URLSearchParams({ q: query })
                          : new URLSearchParams();
                      loadListing(next);
                    }}
                  >
                    Resetuj
                  </a>
                </div>
              </form>
            </aside>
            </>
          ) : undefined
        }
      >
        {isLoading ? (
          <CatalogListingSkeleton />
        ) : view.products.length > 0 ? (
          <>
            <div className={catalogProductGridClassName}>
              {view.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <CatalogPaginationClient
              currentPage={view.currentPage}
              totalPages={view.totalPages}
              ariaLabel={
                mode === "search"
                  ? "Paginacja wyszukiwania — dół"
                  : "Paginacja kategorii — dół"
              }
              className="mt-6"
              idSuffix="-bottom"
              onPageChange={onPageChange}
              onPagePrefetch={onPagePrefetch}
            />
          </>
        ) : !view.tooShort ? (
          <p className="text-water-500">Nie znaleziono produktów.</p>
        ) : null}
      </CatalogListingGrid>
    </>
  );
}
