import { readCatalogCache } from "./catalog-cache";
import { getFallbackImage } from "./product-images";
import type { Product } from "./types";

const PLACEHOLDER =
  "https://image.ceneostatic.pl/data/categories/850/socialMediaImage.png";

export async function resolveProductImage(product: Product): Promise<string> {
  const cache = await readCatalogCache();
  const cached = cache.products[product.id]?.imageUrl;
  if (cached && !cached.includes("socialMediaImage")) return cached;
  if (product.image.startsWith("http")) return product.image;
  return getFallbackImage(product.id) ?? PLACEHOLDER;
}

export async function enrichProductsWithImages<T extends Product>(
  list: T[]
): Promise<(T & { displayImage: string })[]> {
  const cache = await readCatalogCache();
  return list.map((p) => {
    const cached = cache.products[p.id]?.imageUrl;
    const displayImage =
      cached && !cached.includes("socialMediaImage")
        ? cached
        : p.image.startsWith("http")
          ? p.image
          : getFallbackImage(p.id) ?? PLACEHOLDER;
    return { ...p, displayImage };
  });
}
