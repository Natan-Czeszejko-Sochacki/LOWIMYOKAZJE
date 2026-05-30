import type { CategoryPageResult } from "@/lib/category-catalog";
import type { SearchPageResult } from "@/lib/search-catalog";
import type { ProductWithOffers } from "@/lib/types";

export type CatalogListingView = {
  products: ProductWithOffers[];
  totalFiltered: number;
  totalPool: number;
  storeOptions: { id: string; name: string }[];
  brandOptions: string[];
  currentPage: number;
  totalPages: number;
  tooShort?: boolean;
};

export function searchResultToView(result: SearchPageResult): CatalogListingView {
  return {
    products: result.products,
    totalFiltered: result.totalFiltered,
    totalPool: result.totalMatches,
    storeOptions: result.storeOptions,
    brandOptions: result.brandOptions,
    currentPage: result.currentPage,
    totalPages: result.totalPages,
    tooShort: result.tooShort,
  };
}

export function categoryResultToView(result: CategoryPageResult): CatalogListingView {
  return {
    products: result.products,
    totalFiltered: result.totalFiltered,
    totalPool: result.totalInCategory,
    storeOptions: result.storeOptions,
    brandOptions: result.brandOptions,
    currentPage: result.currentPage,
    totalPages: result.totalPages,
  };
}
