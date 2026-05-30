import { unstable_cache } from "next/cache";
import {
  getCategoryFacetsUncached,
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
  const includeFacets = filters.includeFacets !== false;
  return unstable_cache(
    () => getCategoryPageListingUncached(slug, { ...filters, includeFacets }),
    ["category-v4", key, includeFacets ? "f" : "nf"],
    { revalidate: 300, tags: [`category-${slug}`] }
  )();
}

export function getCategoryFacets(
  slug: string,
  filters: CategoryListingFilters
): Promise<{
  storeOptions: CategoryPageResult["storeOptions"];
  brandOptions: CategoryPageResult["brandOptions"];
}> {
  const key = `facets|${filterCacheKey(slug, filters)}`;
  return unstable_cache(
    () => getCategoryFacetsUncached(slug, filters),
    ["category-facets-v1", key],
    { revalidate: 300, tags: [`category-${slug}`] }
  )();
}

export type { CategoryListingFilters, CategoryPageResult };
