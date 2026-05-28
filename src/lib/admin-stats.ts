import { getDb, getSyncStats } from "./db";
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

const ACTIVE_LISTING = `l.price IS NOT NULL AND l.price > 0 AND l.in_stock = 1`;

export function getAdminOverview(): AdminOverview {
  const db = getDb();
  const sync = getSyncStats();

  const activePriced = db
    .prepare(`SELECT COUNT(*) AS c FROM listings WHERE price IS NOT NULL AND price > 0`)
    .get() as { c: number };

  const inStock = db
    .prepare(
      `SELECT COUNT(*) AS c FROM listings WHERE price IS NOT NULL AND price > 0 AND in_stock = 1`
    )
    .get() as { c: number };

  const storeRows = db
    .prepare(
      `SELECT store_id, COUNT(*) AS c
       FROM listings
       WHERE price IS NOT NULL AND price > 0
       GROUP BY store_id
       ORDER BY c DESC`
    )
    .all() as { store_id: string; c: number }[];

  const distributionRows = db
    .prepare(
      `SELECT store_count, COUNT(*) AS product_count
       FROM (
         SELECT g.id, COUNT(DISTINCT l.store_id) AS store_count
         FROM product_groups g
         INNER JOIN listings l ON l.group_id = g.id
         WHERE ${ACTIVE_LISTING}
         GROUP BY g.id
       )
       GROUP BY store_count
       ORDER BY store_count ASC`
    )
    .all() as { store_count: number; product_count: number }[];

  const multiStore = distributionRows
    .filter((r) => r.store_count > 1)
    .reduce((sum, r) => sum + r.product_count, 0);

  return {
    totalGroups: sync.groups,
    totalListings: sync.listings,
    activePricedListings: activePriced.c,
    inStockListings: inStock.c,
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

export function countMultiStoreProducts(
  minStores: number,
  maxStores: number
): number {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) AS c FROM (
         SELECT g.id
         FROM product_groups g
         INNER JOIN listings l ON l.group_id = g.id
         WHERE ${ACTIVE_LISTING}
         GROUP BY g.id
         HAVING COUNT(DISTINCT l.store_id) >= ? AND COUNT(DISTINCT l.store_id) <= ?
       )`
    )
    .get(minStores, maxStores) as { c: number };
  return row.c;
}

export function getMultiStoreProducts(
  minStores: number,
  maxStores: number,
  limit = 200,
  offset = 0
): MultiStoreProduct[] {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT
         g.id,
         g.name,
         g.slug,
         COUNT(DISTINCT l.store_id) AS store_count,
         COUNT(*) AS offer_count,
         MIN(l.price) AS min_price,
         MAX(l.price) AS max_price,
         GROUP_CONCAT(DISTINCT l.store_id) AS store_ids
       FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
       WHERE ${ACTIVE_LISTING}
       GROUP BY g.id
       HAVING store_count >= ? AND store_count <= ?
       ORDER BY store_count DESC, offer_count DESC, g.name ASC
       LIMIT ? OFFSET ?`
    )
    .all(minStores, maxStores, limit, offset) as {
    id: string;
    name: string;
    slug: string;
    store_count: number;
    offer_count: number;
    min_price: number;
    max_price: number;
    store_ids: string;
  }[];

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
