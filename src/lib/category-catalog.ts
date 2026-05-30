import { unstable_cache } from "next/cache";
import {
  getCategoryPageListingUncached,
  type CategoryListingFilters,
  type CategoryPageResult,
} from "./catalog-db";

function filterCacheKey(slug: string, filters: CategoryListingFilters): string {
  const parts = [
    slug,
    filters.q ?? "",
    filters.store ?? "",
    filters.brand ?? "",
    String(filters.minPromo ?? 0),
    String(filters.minPrice ?? ""),
    String(filters.maxPrice ?? ""),
    filters.sort ?? "relevance",
    String(filters.page ?? 1),
  ];
  return parts.join("|");
}

export function getCategoryPageListing(
  slug: string,
  filters: CategoryListingFilters
): Promise<CategoryPageResult> {
  const key = filterCacheKey(slug, filters);
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.store ||
      filters.brand ||
      (filters.minPromo ?? 0) > 0 ||
      filters.minPrice != null ||
      filters.maxPrice != null ||
      (filters.sort && filters.sort !== "relevance") ||
      (filters.page ?? 1) > 1
  );

  if (hasActiveFilters) {
    return getCategoryPageListingUncached(slug, filters);
  }

  return unstable_cache(
    () => getCategoryPageListingUncached(slug, filters),
    ["category-default-v1", key],
    { revalidate: 300, tags: [`category-${slug}`] }
  )();
}

export type { CategoryListingFilters, CategoryPageResult };
