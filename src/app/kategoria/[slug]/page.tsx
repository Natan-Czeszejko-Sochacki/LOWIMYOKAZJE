import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogListingClient } from "@/components/catalog/CatalogListingClient";
import { CatalogListingSkeleton } from "@/components/catalog/CatalogListingSkeleton";
import { categoryResultToView } from "@/components/catalog/listing-types";
import {
  categoryParamsFromFilters,
  parseMinPromo,
  parsePageNumber,
  parsePriceParam,
} from "@/lib/catalog-params";
import { getCategoryPageListing } from "@/lib/category-catalog";
import { getCategoryBySlug } from "@/lib/categories";
import { pageMetadata } from "@/lib/site-metadata";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
    store?: string;
    brand?: string;
    promo?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  const name = cat?.name ?? "Kategoria";
  return pageMetadata({
    title: name,
    description: `${name} — porównaj ceny w polskich sklepach wędkarskich na ŁowimyOkazje.pl`,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-2">
        <span className="text-4xl">{category.icon}</span>
        <h1 className="mt-2 text-3xl font-bold text-foreground">{category.name}</h1>
        <p className="mt-4 text-water-400">{category.description}</p>
        <p className="mt-1 text-sm text-water-500">Porównanie w 20 sklepach</p>
      </div>

      <Suspense fallback={<CatalogListingSkeleton count={12} />}>
        <CategoryListingSection slug={slug} categoryName={category.name} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoryListingSection({
  slug,
  categoryName,
  searchParams,
}: {
  slug: string;
  categoryName: string;
  searchParams: Props["searchParams"];
}) {
  const sp = await searchParams;
  const searchQuery = sp.q?.trim() ?? "";
  const filters = {
    q: searchQuery || undefined,
    store: sp.store?.trim() || undefined,
    brand: sp.brand?.trim() || undefined,
    minPromo: parseMinPromo(sp.promo),
    minPrice: parsePriceParam(sp.minPrice),
    maxPrice: parsePriceParam(sp.maxPrice),
    sort: sp.sort?.trim() || "relevance",
    page: parsePageNumber(sp.page),
    includeFacets: false as const,
  };

  const listing = await getCategoryPageListing(slug, filters);
  const view = categoryResultToView(listing);
  const qs = categoryParamsFromFilters(slug, filters).toString();

  const queryLabel = searchQuery
    ? `Wyniki w „${categoryName}" dla „${searchQuery}"`
    : `Kategoria „${categoryName}"`;

  return (
    <CatalogListingClient
      mode="category"
      categorySlug={slug}
      categoryName={categoryName}
      queryLabel={queryLabel}
      initialView={view}
      initialQueryString={qs}
      showInlineSearch={false}
    />
  );
}
