import { unstable_cache } from "next/cache";
import {
  getSearchPageListingUncached,
  type SearchListingFilters,
  type SearchPageResult,
} from "./catalog-db";

export const MIN_SEARCH_QUERY_LENGTH = 2;

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

  const hasActiveFilters = Boolean(
    filters.store ||
      filters.brand ||
      (filters.minPromo ?? 0) > 0 ||
      filters.minPrice != null ||
      filters.maxPrice != null ||
      (filters.sort && filters.sort !== "relevance") ||
      (filters.page ?? 1) > 1
  );

  if (hasActiveFilters) {
    return getSearchPageListingUncached(filters);
  }

  const key = filterCacheKey(filters);
  return unstable_cache(
    () => getSearchPageListingUncached(filters),
    ["search-v3", key],
    { revalidate: 300 }
  )();
}

export type { SearchListingFilters, SearchPageResult };
