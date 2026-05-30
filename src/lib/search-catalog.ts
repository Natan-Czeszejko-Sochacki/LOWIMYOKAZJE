import { unstable_cache } from "next/cache";
import {
  getSearchFacetsUncached,
  getSearchPageListingUncached,
  type SearchListingFilters,
  type SearchPageResult,
} from "./catalog-db";

import { MIN_SEARCH_QUERY_LENGTH } from "./search-constants";

export { MIN_SEARCH_QUERY_LENGTH };

function filterCacheKey(filters: SearchListingFilters): string {
  return [
    filters.q,
    filters.store ?? "",
    filters.brand ?? "",
    String(filters.minPromo ?? 0),
    String(filters.minPrice ?? ""),
    String(filters.maxPrice ?? ""),
    filters.sort ?? "relevance",
    String(filters.page ?? 1),
  ].join("|");
}

export function getSearchPageListing(
  filters: SearchListingFilters
): Promise<SearchPageResult> {
  const q = filters.q.trim();
  if (q.length < MIN_SEARCH_QUERY_LENGTH) {
    return Promise.resolve({
      products: [],
      totalFiltered: 0,
      totalMatches: 0,
      storeOptions: [],
      brandOptions: [],
      currentPage: 1,
      totalPages: 1,
      tooShort: true,
    });
  }

  const key = filterCacheKey(filters);
  const includeFacets = filters.includeFacets !== false;
  return unstable_cache(
    () => getSearchPageListingUncached({ ...filters, includeFacets }),
    ["search-v4", key, includeFacets ? "f" : "nf"],
    { revalidate: 300 }
  )();
}

export function getSearchFacets(filters: SearchListingFilters): Promise<{
  storeOptions: SearchPageResult["storeOptions"];
  brandOptions: SearchPageResult["brandOptions"];
}> {
  const q = filters.q.trim();
  if (q.length < MIN_SEARCH_QUERY_LENGTH) {
    return Promise.resolve({ storeOptions: [], brandOptions: [] });
  }
  const key = `facets|${filterCacheKey(filters)}`;
  return unstable_cache(
    () => getSearchFacetsUncached(filters),
    ["search-facets-v1", key],
    { revalidate: 300 }
  )();
}

export type { SearchListingFilters, SearchPageResult };
