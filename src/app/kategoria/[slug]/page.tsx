import { notFound } from "next/navigation";
import {
  CatalogListingGrid,
  catalogProductGridClassName,
} from "@/components/CatalogListingGrid";
import { CatalogPagination } from "@/components/CatalogPagination";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryBySlug } from "@/lib/categories";
import { getCatalogProducts } from "@/lib/catalog";
import { getStoreById } from "@/lib/stores";
import { formatManufacturerDisplay } from "@/lib/product-matcher";

export const revalidate = 300;

const CATEGORY_PRODUCT_LIMIT = 96;

function parsePageNumber(value?: string): number {
  const page = Number.parseInt(value ?? "", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  return { title: cat?.name ?? "Kategoria" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page, q, sort, store, brand, promo, minPrice, maxPrice } = await searchParams;
  const searchQuery = q?.trim() ?? "";
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const baseResults = await getCatalogProducts(slug);
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
      if (searchQuery) {
        const needle = searchQuery.toLowerCase();
        const inName = p.name.toLowerCase().includes(needle);
        const inBrand = (p.brand ?? "").toLowerCase().includes(needle);
        const inManufacturer = manufacturer.toLowerCase().includes(needle);
        if (!inName && !inBrand && !inManufacturer) return false;
      }
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
  const totalPages = Math.max(1, Math.ceil(results.length / CATEGORY_PRODUCT_LIMIT));
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * CATEGORY_PRODUCT_LIMIT;
  const products = results.slice(offset, offset + CATEGORY_PRODUCT_LIMIT);

  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedSort && selectedSort !== "relevance") params.set("sort", selectedSort);
    if (selectedStore) params.set("store", selectedStore);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (minPromoValue > 0) params.set("promo", String(minPromoValue));
    if (minPrice?.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice?.trim()) params.set("maxPrice", maxPrice.trim());
    if (targetPage > 1) params.set("page", String(targetPage));
    if (params.size === 0) return `/kategoria/${encodeURIComponent(slug)}`;
    return `/kategoria/${encodeURIComponent(slug)}?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="text-4xl">{category.icon}</span>
        <h1 className="mt-2 text-3xl font-bold text-foreground">{category.name}</h1>

        <form
          action={`/kategoria/${encodeURIComponent(slug)}`}
          method="get"
          className="mt-4 max-w-2xl"
          role="search"
        >
          {selectedSort && selectedSort !== "relevance" && (
            <input type="hidden" name="sort" value={selectedSort} />
          )}
          {selectedStore && <input type="hidden" name="store" value={selectedStore} />}
          {selectedBrand && <input type="hidden" name="brand" value={selectedBrand} />}
          {minPromoValue > 0 && <input type="hidden" name="promo" value={String(minPromoValue)} />}
          {minPrice?.trim() && <input type="hidden" name="minPrice" value={minPrice.trim()} />}
          {maxPrice?.trim() && <input type="hidden" name="maxPrice" value={maxPrice.trim()} />}
          <div className="relative">
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder={`Szukaj po nazwie w „${category.name}"…`}
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

        <p className="mt-4 text-water-400">{category.description}</p>
        <p className="mt-1 text-sm text-water-500">
          {results.length} z {baseResults.length} produktów
          {searchQuery ? ` dla „${searchQuery}"` : ""} · porównanie w 20 sklepach
        </p>
      </div>

      <CatalogListingGrid
        topPagination={
          products.length > 0 ? (
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageHref={pageHref}
              ariaLabel="Paginacja kategorii"
            />
          ) : undefined
        }
        sidebar={
          <aside className="h-fit rounded-xl border border-water-700 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Sortowanie i filtry
          </h2>
          <form
            action={`/kategoria/${encodeURIComponent(slug)}`}
            method="get"
            className="mt-4 space-y-4"
          >
            {searchQuery && <input type="hidden" name="q" value={searchQuery} />}

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
                href={`/kategoria/${encodeURIComponent(slug)}`}
                className="rounded-lg border border-water-700 px-3 py-2 text-sm font-medium text-water-500 hover:bg-water-900 hover:text-foreground"
              >
                Resetuj
              </a>
            </div>
          </form>
          </aside>
        }
      >
        {products.length > 0 ? (
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
              ariaLabel="Paginacja kategorii — dół"
              className="mt-6"
              idSuffix="-bottom"
            />
          </>
        ) : (
          <p className="text-water-500">
            {searchQuery
              ? `Brak produktów pasujących do „${searchQuery}" w tej kategorii.`
              : "Nie znaleziono produktów dla wybranych filtrów."}
          </p>
        )}
      </CatalogListingGrid>
    </div>
  );
}
