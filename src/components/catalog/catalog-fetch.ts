import type { CatalogListingView } from "./listing-types";

const memoryCache = new Map<string, Promise<CatalogListingView | { storeOptions: []; brandOptions: [] }>>();

export function catalogApiUrl(
  mode: "search" | "category",
  slug: string | undefined,
  params: URLSearchParams,
  options?: { facetsOnly?: boolean; includeFacets?: boolean }
): string {
  const p = new URLSearchParams(params);
  if (options?.facetsOnly) p.set("facetsOnly", "1");
  if (options?.includeFacets === false) p.set("includeFacets", "0");
  const qs = p.toString();
  if (mode === "search") {
    return `/api/catalog/search${qs ? `?${qs}` : ""}`;
  }
  return `/api/catalog/category/${encodeURIComponent(slug ?? "")}${qs ? `?${qs}` : ""}`;
}

export async function fetchCatalogListing(url: string): Promise<CatalogListingView> {
  let pending = memoryCache.get(url);
  if (!pending) {
    pending = fetch(url, { priority: "high" }).then(async (res) => {
      if (!res.ok) throw new Error(`catalog ${res.status}`);
      return res.json() as Promise<CatalogListingView>;
    });
    memoryCache.set(url, pending);
    pending.finally(() => {
      setTimeout(() => memoryCache.delete(url), 30_000);
    });
  }
  return pending as Promise<CatalogListingView>;
}

export async function fetchCatalogFacets(
  mode: "search" | "category",
  slug: string | undefined,
  params: URLSearchParams
): Promise<{ storeOptions: CatalogListingView["storeOptions"]; brandOptions: string[] }> {
  const url = catalogApiUrl(mode, slug, params, { facetsOnly: true });
  let pending = memoryCache.get(url);
  if (!pending) {
    pending = fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`facets ${res.status}`);
      return res.json();
    });
    memoryCache.set(url, pending);
    pending.finally(() => {
      setTimeout(() => memoryCache.delete(url), 60_000);
    });
  }
  return pending as Promise<{
    storeOptions: CatalogListingView["storeOptions"];
    brandOptions: string[];
  }>;
}

export function prefetchCatalogListing(url: string): void {
  if (typeof window === "undefined") return;
  void fetchCatalogListing(url).catch(() => undefined);
}
