import { Suspense } from "react";
import { CatalogListingClient } from "@/components/catalog/CatalogListingClient";
import { CatalogListingSkeleton } from "@/components/catalog/CatalogListingSkeleton";
import { searchResultToView } from "@/components/catalog/listing-types";
import {
  parseMinPromo,
  parsePageNumber,
  parsePriceParam,
  searchParamsFromFilters,
} from "@/lib/catalog-params";
import { getSearchPageListing } from "@/lib/search-catalog";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/search-constants";

export const revalidate = 300;

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
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Szukaj</h1>
      {!query ? (
        <p className="mt-2 text-water-400">
          Wpisz frazę w wyszukiwarkę u góry strony (min. {MIN_SEARCH_QUERY_LENGTH} znaki).
        </p>
      ) : (
        <Suspense fallback={<CatalogListingSkeleton count={12} />}>
          <SearchListingSection sp={sp} query={query} />
        </Suspense>
      )}
    </div>
  );
}

async function SearchListingSection({
  sp,
  query,
}: {
  sp: Awaited<Props["searchParams"]>;
  query: string;
}) {
  const filters = {
    q: query,
    store: sp.store?.trim() || undefined,
    brand: sp.brand?.trim() || undefined,
    minPromo: parseMinPromo(sp.promo),
    minPrice: parsePriceParam(sp.minPrice),
    maxPrice: parsePriceParam(sp.maxPrice),
    sort: sp.sort?.trim() || "relevance",
    page: parsePageNumber(sp.page),
    includeFacets: false as const,
  };

  const listing = await getSearchPageListing(filters);
  const view = searchResultToView(listing);
  const qs = searchParamsFromFilters({ ...filters, includeFacets: undefined }).toString();

  return (
    <CatalogListingClient
      mode="search"
      queryLabel={`Wyniki dla „${query}"`}
      initialView={view}
      initialQueryString={qs}
      showInlineSearch
    />
  );
}
