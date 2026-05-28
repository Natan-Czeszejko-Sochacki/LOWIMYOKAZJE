import { promises as fs } from "fs";
import path from "path";

export type ProductCacheEntry = {
  imageUrl: string;
  ceneoId?: string;
  updatedAt: string;
};

export type CatalogCache = {
  products: Record<string, ProductCacheEntry>;
  lastFullSync?: string;
};

const CACHE_FILE = path.join(process.cwd(), "data", "catalog-cache.json");

export async function readCatalogCache(): Promise<CatalogCache> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as CatalogCache;
  } catch {
    return { products: {} };
  }
}

export async function writeCatalogCache(cache: CatalogCache): Promise<void> {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

export async function updateProductCache(
  productId: string,
  entry: Omit<ProductCacheEntry, "updatedAt"> & { updatedAt?: string }
): Promise<void> {
  const cache = await readCatalogCache();
  cache.products[productId] = {
    ...entry,
    updatedAt: entry.updatedAt ?? new Date().toISOString(),
  };
  await writeCatalogCache(cache);
}
