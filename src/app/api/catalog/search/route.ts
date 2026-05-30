import { NextResponse } from "next/server";
import { CATALOG_JSON_CACHE_CONTROL } from "@/lib/api-cache-headers";
import { searchFiltersFromSearchParams } from "@/lib/catalog-params";
import { getSearchFacets, getSearchPageListing } from "@/lib/search-catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const facetsOnly = url.searchParams.get("facetsOnly") === "1";

  const filters = searchFiltersFromSearchParams(url.searchParams);
  if (!filters) {
    return NextResponse.json(
      { error: "query_too_short" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (facetsOnly) {
    const facets = await getSearchFacets(filters);
    return NextResponse.json(facets, {
      headers: { "Cache-Control": CATALOG_JSON_CACHE_CONTROL },
    });
  }

  const listing = await getSearchPageListing({
    ...filters,
    includeFacets: url.searchParams.get("includeFacets") !== "0",
  });

  return NextResponse.json(listing, {
    headers: { "Cache-Control": CATALOG_JSON_CACHE_CONTROL },
  });
}
