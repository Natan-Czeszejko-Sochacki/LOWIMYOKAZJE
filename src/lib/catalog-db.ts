import { getDb, getSyncStats } from "./db";
import { enrichProduct, getHotDeals } from "./price-engine";
import type { ProductWithOffers, StoreOffer, Product } from "./types";
import { ALLOWED_STORE_IDS } from "./store-configs";
import { getCategoryDescendantSlugs, resolveProductCategorySlug } from "./categories";
import { normalizeEan } from "./product-matcher";

const ALLOWED_STORE_IDS_LIST = [...ALLOWED_STORE_IDS];
const ALLOWED_STORE_PLACEHOLDERS = ALLOWED_STORE_IDS_LIST.map(() => "?").join(",");

type GroupRow = {
  id: string;
  name: string;
  brand: string | null;
  slug: string;
  image_url: string | null;
  category_id: string;
};

type ListingRow = {
  id: string;
  group_id: string;
  store_id: string;
  name: string;
  url: string;
  price: number | null;
  original_price: number | null;
  previous_price: number | null;
  lowest_price_30d: number | null;
  image_url: string | null;
  ean: string | null;
  producer_code: string | null;
  brand: string | null;
  in_stock: number;
  updated_at: string;
};

function enrichProductFromListings(
  product: Product,
  rows: ListingRow[],
  group: GroupRow
): Product {
  const ean = rows.map((r) => normalizeEan(r.ean)).find(Boolean);
  const brand =
    product.brand?.trim() ||
    rows.find((r) => r.brand?.trim())?.brand?.trim() ||
    "";
  const categoryId = resolveProductCategorySlug(
    group.category_id,
    group.name,
    ...rows.map((r) => r.name)
  );

  return {
    ...product,
    ean: ean ?? undefined,
    brand,
    categoryId,
  };
}

function groupToProduct(row: GroupRow, image: string): Product {
  const categoryId = resolveProductCategorySlug(row.category_id, row.name);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? "",
    categoryId,
    image,
    searchQuery: row.name,
    description: row.name,
  };
}

function listingToOffer(row: ListingRow): StoreOffer {
  return {
    storeId: row.store_id,
    productId: row.group_id,
    price: row.price ?? 0,
    originalPrice: row.original_price ?? undefined,
    lowestPrice30d: row.lowest_price_30d ?? undefined,
    previousPrice: row.previous_price ?? undefined,
    currency: "PLN",
    url: row.url,
    inStock: row.in_stock === 1,
    updatedAt: row.updated_at,
  };
}

type CatalogProductOptions = {
  limit?: number;
  offset?: number;
};

function groupRowsByProduct(rows: ListingRow[]): Map<string, ListingRow[]> {
  const byGroup = new Map<string, ListingRow[]>();
  for (const row of rows) {
    const existingRows = byGroup.get(row.group_id);
    if (existingRows) {
      existingRows.push(row);
    } else {
      byGroup.set(row.group_id, [row]);
    }
  }
  return byGroup;
}

function getListingsForGroups(groupIds: string[]): ListingRow[] {
  if (groupIds.length === 0) return [];

  const db = getDb();
  if (groupIds.length > 900) {
    return db
      .prepare(
        `SELECT * FROM listings
         WHERE store_id IN (${ALLOWED_STORE_PLACEHOLDERS})
           AND price IS NOT NULL
           AND price > 0`
      )
      .all(...ALLOWED_STORE_IDS_LIST) as ListingRow[];
  }

  const groupPlaceholders = groupIds.map(() => "?").join(",");
  return db
    .prepare(
      `SELECT * FROM listings
       WHERE group_id IN (${groupPlaceholders})
         AND store_id IN (${ALLOWED_STORE_PLACEHOLDERS})`
    )
    .all(...groupIds, ...ALLOWED_STORE_IDS_LIST) as ListingRow[];
}

function groupsToProducts(
  groups: GroupRow[],
  listingsByGroup: Map<string, ListingRow[]>,
  categorySlugs: Set<string> | null
): ProductWithOffers[] {
  const result: ProductWithOffers[] = [];

  for (const g of groups) {
    const rows = listingsByGroup.get(g.id) ?? [];
    if (rows.length === 0) continue;

    const offers = rows
      .filter((r) => r.price !== null && r.price > 0 && r.url)
      .map(listingToOffer)
      .sort((a, b) => a.price - b.price);

    if (offers.length === 0) continue;

    const resolvedCategory = resolveProductCategorySlug(
      g.category_id,
      g.name,
      ...rows.map((r) => r.name)
    );
    if (categorySlugs && !categorySlugs.has(resolvedCategory)) continue;

    const bestImage =
      rows.find((r) => r.image_url)?.image_url ?? g.image_url ?? "";

    const product = enrichProductFromListings(
      groupToProduct(g, bestImage),
      rows,
      g
    );
    result.push(enrichProduct(product, offers));
  }

  return result;
}

export function getListingsForCatalog(): StoreOffer[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM listings WHERE store_id IN (${ALLOWED_STORE_PLACEHOLDERS}) AND price IS NOT NULL AND price > 0`
    )
    .all(...ALLOWED_STORE_IDS_LIST) as ListingRow[];
  return rows.map(listingToOffer);
}

export async function getCatalogProducts(
  categorySlug?: string,
  options: CatalogProductOptions = {}
): Promise<ProductWithOffers[]> {
  const db = getDb();
  const categorySlugs = categorySlug
    ? getCategoryDescendantSlugs(categorySlug)
    : null;
  const targetCount =
    options.limit != null ? (options.offset ?? 0) + options.limit : null;
  const groupLimit = targetCount ? targetCount * 3 : null;

  const groups = categorySlugs
    ? (db
        .prepare(
          `SELECT * FROM product_groups
           WHERE category_id IN (${[...categorySlugs].map(() => "?").join(",")})
           ORDER BY updated_at DESC
           ${groupLimit ? "LIMIT ?" : ""}`
        )
        .all(...categorySlugs, ...(groupLimit ? [groupLimit] : [])) as GroupRow[])
    : (db
        .prepare(
          `SELECT * FROM product_groups
           ORDER BY updated_at DESC
           ${groupLimit ? "LIMIT ?" : ""}`
        )
        .all(...(groupLimit ? [groupLimit] : [])) as GroupRow[]);

  const listingsByGroup = groupRowsByProduct(
    getListingsForGroups(groups.map((g) => g.id))
  );
  const products = groupsToProducts(groups, listingsByGroup, categorySlugs);
  const offset = Math.max(0, options.offset ?? 0);
  const end = options.limit != null ? offset + options.limit : undefined;
  return products.slice(offset, end);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductWithOffers[]> {
  return getCatalogProducts(undefined, { limit });
}

export async function getCatalogProductCount(categorySlug?: string): Promise<number> {
  const db = getDb();
  const categorySlugs = categorySlug
    ? getCategoryDescendantSlugs(categorySlug)
    : null;

  if (!categorySlugs) {
    const row = db
      .prepare(
        `SELECT COUNT(DISTINCT g.id) AS c
         FROM product_groups g
         INNER JOIN listings l ON l.group_id = g.id
         WHERE l.store_id IN (${ALLOWED_STORE_PLACEHOLDERS})
           AND l.price IS NOT NULL
           AND l.price > 0`
      )
      .get(...ALLOWED_STORE_IDS_LIST) as { c: number };
    return row.c;
  }

  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT g.id) AS c
       FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
       WHERE g.category_id IN (${[...categorySlugs].map(() => "?").join(",")})
         AND l.store_id IN (${ALLOWED_STORE_PLACEHOLDERS})
         AND l.price IS NOT NULL
         AND l.price > 0`
    )
    .get(...categorySlugs, ...ALLOWED_STORE_IDS_LIST) as { c: number };
  return row.c;
}

export async function getProductWithOffers(
  slugOrId: string
): Promise<ProductWithOffers | null> {
  const db = getDb();

  const alias = db
    .prepare("SELECT canonical_slug FROM slug_aliases WHERE alias = ?")
    .get(slugOrId) as { canonical_slug: string } | undefined;
  const lookupSlug = alias?.canonical_slug ?? slugOrId;

  const group = db
    .prepare("SELECT * FROM product_groups WHERE slug = ? OR id = ?")
    .get(lookupSlug, slugOrId) as GroupRow | undefined;

  if (!group) return null;

  const rows = db
    .prepare(
      `SELECT * FROM listings WHERE group_id = ? AND store_id IN (${ALLOWED_STORE_PLACEHOLDERS}) ORDER BY price ASC`
    )
    .all(group.id, ...ALLOWED_STORE_IDS_LIST) as ListingRow[];

  const offers = rows
    .filter((r) => r.price !== null && r.price > 0)
    .map(listingToOffer);

  if (offers.length === 0) return null;

  const image = rows.find((r) => r.image_url)?.image_url ?? group.image_url ?? "";
  return enrichProduct(
    enrichProductFromListings(groupToProduct(group, image), rows, group),
    offers
  );
}

export async function getHomepageDeals(): Promise<ProductWithOffers[]> {
  const db = getDb();
  const groups = db
    .prepare(
      `SELECT g.*,
              (MAX(COALESCE(NULLIF(l.original_price, 0), l.price)) / MIN(l.price)) AS deal_score
       FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
       WHERE l.store_id IN (${ALLOWED_STORE_PLACEHOLDERS})
         AND l.price IS NOT NULL
         AND l.price > 0
       GROUP BY g.id
       HAVING deal_score > 1
       ORDER BY deal_score DESC, g.updated_at DESC
       LIMIT 200`
    )
    .all(...ALLOWED_STORE_IDS_LIST) as GroupRow[];

  const listingsByGroup = groupRowsByProduct(
    getListingsForGroups(groups.map((g) => g.id))
  );
  return getHotDeals(groupsToProducts(groups, listingsByGroup, null), 15).slice(0, 12);
}

export async function searchProducts(query: string): Promise<ProductWithOffers[]> {
  const q = query.trim();
  if (!q) return [];

  const db = getDb();
  const pattern = `%${q}%`;

  const groups = db
    .prepare(
      `SELECT DISTINCT g.* FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
       WHERE (l.name LIKE ? OR l.brand LIKE ? OR g.name LIKE ? OR g.brand LIKE ? OR l.ean LIKE ? OR l.producer_code LIKE ?)
       AND l.price IS NOT NULL AND l.price > 0
       AND l.store_id IN (${ALLOWED_STORE_PLACEHOLDERS})
       ORDER BY g.updated_at DESC
       LIMIT 5000`
    )
    .all(
      pattern,
      pattern,
      pattern,
      pattern,
      pattern,
      pattern,
      ...ALLOWED_STORE_IDS_LIST
    ) as GroupRow[];

  const result: ProductWithOffers[] = [];
  const listingStmt = db.prepare(
    `SELECT * FROM listings WHERE group_id = ? AND store_id IN (${ALLOWED_STORE_PLACEHOLDERS})`
  );

  for (const g of groups) {
    const rows = listingStmt.all(g.id, ...ALLOWED_STORE_IDS_LIST) as ListingRow[];
    const offers = rows.filter((r) => r.price != null && r.price > 0).map(listingToOffer);
    if (offers.length === 0) continue;
    const image = rows.find((r) => r.image_url)?.image_url ?? "";
    result.push(
      enrichProduct(
        enrichProductFromListings(groupToProduct(g, image), rows, g),
        offers
      )
    );
  }

  return result;
}

export function getLastSyncTime(): string | null {
  return getSyncStats().lastSync;
}
