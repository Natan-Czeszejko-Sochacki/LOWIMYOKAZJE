import type { CategoryListingFilters } from "./catalog-db";
import type { SearchListingFilters } from "./catalog-db";

export function parsePriceParam(value?: string | null): number | null {
  if (!value?.trim()) return null;
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

export function parsePageNumber(value?: string | null): number {
  const page = Number.parseInt(value ?? "", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function parseMinPromo(value?: string | null): number {
  const minPromo = Number.parseInt(value ?? "", 10);
  return Number.isFinite(minPromo) ? minPromo : 0;
}

export function searchFiltersFromSearchParams(
  params: URLSearchParams
): SearchListingFilters | null {
  const q = params.get("q")?.trim() ?? "";
  if (q.length < 2) return null;
  return {
    q,
    store: params.get("store")?.trim() || undefined,
    brand: params.get("brand")?.trim() || undefined,
    minPromo: parseMinPromo(params.get("promo")),
    minPrice: parsePriceParam(params.get("minPrice")),
    maxPrice: parsePriceParam(params.get("maxPrice")),
    sort: params.get("sort")?.trim() || "relevance",
    page: parsePageNumber(params.get("page")),
  };
}

export function categoryFiltersFromSearchParams(
  params: URLSearchParams
): CategoryListingFilters {
  return {
    q: params.get("q")?.trim() || undefined,
    store: params.get("store")?.trim() || undefined,
    brand: params.get("brand")?.trim() || undefined,
    minPromo: parseMinPromo(params.get("promo")),
    minPrice: parsePriceParam(params.get("minPrice")),
    maxPrice: parsePriceParam(params.get("maxPrice")),
    sort: params.get("sort")?.trim() || "relevance",
    page: parsePageNumber(params.get("page")),
  };
}

export function searchParamsFromFilters(
  filters: SearchListingFilters
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("q", filters.q);
  if (filters.sort && filters.sort !== "relevance") params.set("sort", filters.sort);
  if (filters.store) params.set("store", filters.store);
  if (filters.brand) params.set("brand", filters.brand);
  if ((filters.minPromo ?? 0) > 0) params.set("promo", String(filters.minPromo));
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if ((filters.page ?? 1) > 1) params.set("page", String(filters.page));
  return params;
}

export function categoryParamsFromFilters(
  slug: string,
  filters: CategoryListingFilters
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.sort && filters.sort !== "relevance") params.set("sort", filters.sort);
  if (filters.store) params.set("store", filters.store);
  if (filters.brand) params.set("brand", filters.brand);
  if ((filters.minPromo ?? 0) > 0) params.set("promo", String(filters.minPromo));
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if ((filters.page ?? 1) > 1) params.set("page", String(filters.page));
  return params;
}

export function categoryPagePath(slug: string, params: URLSearchParams): string {
  const qs = params.toString();
  const base = `/kategoria/${encodeURIComponent(slug)}`;
  return qs ? `${base}?${qs}` : base;
}
