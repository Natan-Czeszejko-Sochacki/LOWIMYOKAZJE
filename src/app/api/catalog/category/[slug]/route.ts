import { NextResponse } from "next/server";
import { CATALOG_JSON_CACHE_CONTROL } from "@/lib/api-cache-headers";
import { categoryFiltersFromSearchParams } from "@/lib/catalog-params";
import { getCategoryFacets, getCategoryPageListing } from "@/lib/category-catalog";
import { getCategoryBySlug } from "@/lib/categories";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!getCategoryBySlug(slug)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const facetsOnly = url.searchParams.get("facetsOnly") === "1";
  const filters = categoryFiltersFromSearchParams(url.searchParams);

  if (facetsOnly) {
    const facets = await getCategoryFacets(slug, filters);
    return NextResponse.json(facets, {
      headers: { "Cache-Control": CATALOG_JSON_CACHE_CONTROL },
    });
  }

  const listing = await getCategoryPageListing(slug, {
    ...filters,
    includeFacets: url.searchParams.get("includeFacets") !== "0",
  });

  return NextResponse.json(listing, {
    headers: { "Cache-Control": CATALOG_JSON_CACHE_CONTROL },
  });
}
