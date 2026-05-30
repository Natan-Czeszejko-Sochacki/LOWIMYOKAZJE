import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getProductWithOffers as getProductWithOffersDb } from "./catalog-db";
import type { ProductWithOffers } from "./types";

const PRODUCT_REVALIDATE = 300;

async function loadProduct(slugOrId: string): Promise<ProductWithOffers | null> {
  return getProductWithOffersDb(slugOrId);
}

/** Cache między generateMetadata a stroną produktu (jedno zapytanie na request). */
export const getProductWithOffers = cache((slugOrId: string) =>
  unstable_cache(() => loadProduct(slugOrId), ["product-v1", slugOrId], {
    revalidate: PRODUCT_REVALIDATE,
    tags: [`product-${slugOrId}`],
  })()
);
