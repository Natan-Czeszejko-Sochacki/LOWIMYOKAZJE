import {
  CatalogListingGrid,
  catalogProductGridClassName,
} from "@/components/CatalogListingGrid";
import { CatalogPagination } from "@/components/CatalogPagination";
import { ProductCard } from "@/components/ProductCard";
import {
  getSearchPageListing,
  MIN_SEARCH_QUERY_LENGTH,
} from "@/lib/search-catalog";

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

export default async function SearchPage({ searchParams }: Props) {
  const { q, page, sort, store, brand, promo, minPrice, maxPrice } = await searchParams;
  const query = q?.trim() ?? "";
  const minPromo = Number.parseInt(promo ?? "", 10);
  const minPromoValue = Number.isFinite(minPromo) ? minPromo : 0;

  const listing = query
    ? await getSearchPageListing({
        q: query,
        store: store?.trim() || undefined,
        brand: brand?.trim() || undefined,
        minPromo: minPromoValue,
        minPrice: parsePriceParam(minPrice),
        maxPrice: parsePriceParam(maxPrice),
        sort: sort?.trim() || "relevance",
        page: parsePageNumber(page),
      })
    : null;

  const {
    products = [],
    totalFiltered = 0,
    totalMatches = 0,
    storeOptions = [],
    brandOptions = [],
    currentPage = 1,
    totalPages = 1,
    tooShort = false,
  } = listing ?? {};

  const selectedStore = store?.trim() ?? "";
  const selectedBrand = brand?.trim() ?? "";
  const selectedSort = sort?.trim() || "relevance";

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
        tooShort ? (
          <p className="mt-2 text-water-400">
            Wpisz co najmniej {MIN_SEARCH_QUERY_LENGTH} znaki (masz {query.length}).
          </p>
        ) : (
          <p className="mt-2 text-water-400">
            Wyniki dla „{query}” — {totalFiltered === totalMatches
              ? `${totalMatches} produktów`
              : `${totalFiltered} z ${totalMatches} produktów`}
          </p>
        )
      ) : (
        <p className="mt-2 text-water-400">Wpisz frazę w wyszukiwarkę u góry strony.</p>
      )}

      <form action="/szukaj" method="get" className="mt-6 max-w-lg">
        <input
          type="search"
          name="q"
          defaultValue={query}
          minLength={MIN_SEARCH_QUERY_LENGTH}
          placeholder="np. Shimano, kołowrotek, wobbler…"
          className="w-full rounded-lg border border-water-700 bg-white px-4 py-3 text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
        />
      </form>

      <CatalogListingGrid
        topPagination={
          products.length > 0 ? (
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageHref={pageHref}
              ariaLabel="Paginacja wyszukiwania"
            />
          ) : undefined
        }
        sidebar={
          query && !tooShort ? (
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
          ) : undefined
        }
      >
        {products.length > 0 && (
          <>
            <div className={catalogProductGridClassName}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageHref={pageHref}
              ariaLabel="Paginacja wyszukiwania — dół"
              className="mt-6"
              idSuffix="-bottom"
            />
          </>
        )}

        {query && !tooShort && products.length === 0 && (
          <p className="text-water-500">Nie znaleziono produktów.</p>
        )}
      </CatalogListingGrid>
    </div>
  );
}
