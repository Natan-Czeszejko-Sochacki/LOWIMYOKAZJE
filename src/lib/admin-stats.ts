import { getSyncStats } from "./db";
import { queryOne, queryRows } from "./sql";
import { getStoreById } from "./stores";

export type StoreListingCount = {
  storeId: string;
  storeName: string;
  count: number;
};

export type StoreCountBucket = {
  storeCount: number;
  productCount: number;
};

export type MultiStoreProduct = {
  id: string;
  name: string;
  slug: string;
  storeCount: number;
  offerCount: number;
  storeIds: string[];
  storeNames: string[];
  minPrice: number;
  maxPrice: number;
  savings: number;
};

export type AdminOverview = {
  totalGroups: number;
  totalListings: number;
  activePricedListings: number;
  inStockListings: number;
  lastSync: string | null;
  storeBreakdown: StoreListingCount[];
  storeCountDistribution: StoreCountBucket[];
  multiStoreProducts: number;
};

const ACTIVE_LISTING = `l.price IS NOT NULL AND l.price > 0 AND l.in_stock = true`;

export async function getAdminOverview(): Promise<AdminOverview> {
  const sync = await getSyncStats();

  const activePriced = await queryOne<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM listings WHERE price IS NOT NULL AND price > 0`
  );

  const inStock = await queryOne<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM listings WHERE price IS NOT NULL AND price > 0 AND in_stock = true`
  );

  const storeRows = await queryRows<{ store_id: string; c: number }>(
    `SELECT store_id, COUNT(*)::int AS c
     FROM listings
     WHERE price IS NOT NULL AND price > 0
     GROUP BY store_id
     ORDER BY c DESC`
  );

  const distributionRows = await queryRows<{
    store_count: number;
    product_count: number;
  }>(
    `SELECT store_count, COUNT(*)::int AS product_count
     FROM (
       SELECT g.id, COUNT(DISTINCT l.store_id)::int AS store_count
       FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
       WHERE ${ACTIVE_LISTING}
       GROUP BY g.id
     ) sub
     GROUP BY store_count
     ORDER BY store_count ASC`
  );

  const multiStore = distributionRows
    .filter((r) => r.store_count > 1)
    .reduce((sum, r) => sum + r.product_count, 0);

  return {
    totalGroups: sync.groups,
    totalListings: sync.listings,
    activePricedListings: activePriced?.c ?? 0,
    inStockListings: inStock?.c ?? 0,
    lastSync: sync.lastSync,
    storeBreakdown: storeRows.map((r) => ({
      storeId: r.store_id,
      storeName: getStoreById(r.store_id)?.name ?? r.store_id,
      count: r.c,
    })),
    storeCountDistribution: distributionRows.map((r) => ({
      storeCount: r.store_count,
      productCount: r.product_count,
    })),
    multiStoreProducts: multiStore,
  };
}

export async function countMultiStoreProducts(
  minStores: number,
  maxStores: number
): Promise<number> {
  const row = await queryOne<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM (
       SELECT g.id
       FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
       WHERE ${ACTIVE_LISTING}
       GROUP BY g.id
       HAVING COUNT(DISTINCT l.store_id) >= ? AND COUNT(DISTINCT l.store_id) <= ?
     ) sub`,
    [minStores, maxStores]
  );
  return row?.c ?? 0;
}

export async function getMultiStoreProducts(
  minStores: number,
  maxStores: number,
  limit = 200,
  offset = 0
): Promise<MultiStoreProduct[]> {
  const rows = await queryRows<{
    id: string;
    name: string;
    slug: string;
    store_count: number;
    offer_count: number;
    min_price: number;
    max_price: number;
    store_ids: string;
  }>(
    `SELECT
       g.id,
       g.name,
       g.slug,
       COUNT(DISTINCT l.store_id)::int AS store_count,
       COUNT(*)::int AS offer_count,
       MIN(l.price) AS min_price,
       MAX(l.price) AS max_price,
       STRING_AGG(DISTINCT l.store_id, ',') AS store_ids
     FROM product_groups g
     INNER JOIN listings l ON l.group_id = g.id
     WHERE ${ACTIVE_LISTING}
     GROUP BY g.id, g.name, g.slug
     HAVING COUNT(DISTINCT l.store_id) >= ? AND COUNT(DISTINCT l.store_id) <= ?
     ORDER BY store_count DESC, offer_count DESC, g.name ASC
     LIMIT ? OFFSET ?`,
    [minStores, maxStores, limit, offset]
  );

  return rows.map((r) => {
    const storeIds = r.store_ids.split(",").filter(Boolean);
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      storeCount: r.store_count,
      offerCount: r.offer_count,
      storeIds,
      storeNames: storeIds.map((id) => getStoreById(id)?.name ?? id),
      minPrice: r.min_price,
      maxPrice: r.max_price,
      savings: r.max_price - r.min_price,
    };
  });
}
