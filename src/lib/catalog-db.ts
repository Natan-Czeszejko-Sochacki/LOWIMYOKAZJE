import { getSyncStats, type ListingRow } from "./db";
import { queryOne, queryRows } from "./sql";
import { enrichProduct, getHotDeals } from "./price-engine";
import type { ProductWithOffers, StoreOffer, Product } from "./types";
import { ALLOWED_STORE_IDS } from "./store-configs";
import { getCategoryDescendantSlugs, resolveProductCategorySlug } from "./categories";
import { normalizeEan } from "./product-matcher";

const ALLOWED_STORE_IDS_LIST = [...ALLOWED_STORE_IDS];

type GroupRow = {
  id: string;
  name: string;
  brand: string | null;
  slug: string;
  image_url: string | null;
  category_id: string;
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
    inStock: row.in_stock === true || row.in_stock === 1,
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

async function getListingsForGroups(groupIds: string[]): Promise<ListingRow[]> {
  if (groupIds.length === 0) return [];

  if (groupIds.length > 900) {
    return queryRows<ListingRow>(
      `SELECT * FROM listings
       WHERE store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")})
         AND price IS NOT NULL
         AND price > 0`,
      ALLOWED_STORE_IDS_LIST
    );
  }

  const groupPlaceholders = groupIds.map(() => "?").join(",");
  return queryRows<ListingRow>(
    `SELECT * FROM listings
     WHERE group_id IN (${groupPlaceholders})
       AND store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")})`,
    [...groupIds, ...ALLOWED_STORE_IDS_LIST]
  );
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

export async function getListingsForCatalog(): Promise<StoreOffer[]> {
  const rows = await queryRows<ListingRow>(
    `SELECT * FROM listings WHERE store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")}) AND price IS NOT NULL AND price > 0`,
    ALLOWED_STORE_IDS_LIST
  );
  return rows.map(listingToOffer);
}

export async function getCatalogProducts(
  categorySlug?: string,
  options: CatalogProductOptions = {}
): Promise<ProductWithOffers[]> {
  const categorySlugs = categorySlug
    ? getCategoryDescendantSlugs(categorySlug)
    : null;
  const targetCount =
    options.limit != null ? (options.offset ?? 0) + options.limit : null;
  const groupLimit = targetCount ? targetCount * 3 : null;

  const groups = categorySlugs
    ? await queryRows<GroupRow>(
        `SELECT * FROM product_groups
         WHERE category_id IN (${[...categorySlugs].map(() => "?").join(",")})
         ORDER BY updated_at DESC
         ${groupLimit ? "LIMIT ?" : ""}`,
        [...categorySlugs, ...(groupLimit ? [groupLimit] : [])]
      )
    : await queryRows<GroupRow>(
        `SELECT * FROM product_groups
         ORDER BY updated_at DESC
         ${groupLimit ? "LIMIT ?" : ""}`,
        groupLimit ? [groupLimit] : []
      );

  const listingsByGroup = groupRowsByProduct(
    await getListingsForGroups(groups.map((g) => g.id))
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
  const categorySlugs = categorySlug
    ? getCategoryDescendantSlugs(categorySlug)
    : null;

  if (!categorySlugs) {
    const row = await queryOne<{ c: number }>(
      `SELECT COUNT(DISTINCT g.id)::int AS c
       FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
       WHERE l.store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")})
         AND l.price IS NOT NULL
         AND l.price > 0`,
      ALLOWED_STORE_IDS_LIST
    );
    return row?.c ?? 0;
  }

  const row = await queryOne<{ c: number }>(
    `SELECT COUNT(DISTINCT g.id)::int AS c
     FROM product_groups g
     INNER JOIN listings l ON l.group_id = g.id
     WHERE g.category_id IN (${[...categorySlugs].map(() => "?").join(",")})
       AND l.store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")})
       AND l.price IS NOT NULL
       AND l.price > 0`,
    [...categorySlugs, ...ALLOWED_STORE_IDS_LIST]
  );
  return row?.c ?? 0;
}

export async function getProductWithOffers(
  slugOrId: string
): Promise<ProductWithOffers | null> {
  const alias = await queryOne<{ canonical_slug: string }>(
    "SELECT canonical_slug FROM slug_aliases WHERE alias = ?",
    [slugOrId]
  );
  const lookupSlug = alias?.canonical_slug ?? slugOrId;

  const group = await queryOne<GroupRow>(
    "SELECT * FROM product_groups WHERE slug = ? OR id = ?",
    [lookupSlug, slugOrId]
  );

  if (!group) return null;

  const rows = await queryRows<ListingRow>(
    `SELECT * FROM listings WHERE group_id = ? AND store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")}) ORDER BY price ASC`,
    [group.id, ...ALLOWED_STORE_IDS_LIST]
  );

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
  const groups = await queryRows<GroupRow>(
    `SELECT g.*,
            (MAX(COALESCE(NULLIF(l.original_price, 0), l.price)) / MIN(l.price)) AS deal_score
     FROM product_groups g
     INNER JOIN listings l ON l.group_id = g.id
     WHERE l.store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")})
       AND l.price IS NOT NULL
       AND l.price > 0
     GROUP BY g.id, g.name, g.brand, g.slug, g.image_url, g.category_id, g.updated_at
     HAVING (MAX(COALESCE(NULLIF(l.original_price, 0), l.price)) / MIN(l.price)) > 1
     ORDER BY deal_score DESC, g.updated_at DESC
     LIMIT 200`,
    ALLOWED_STORE_IDS_LIST
  );

  const listingsByGroup = groupRowsByProduct(
    await getListingsForGroups(groups.map((g) => g.id))
  );
  return getHotDeals(groupsToProducts(groups, listingsByGroup, null), 15).slice(0, 12);
}

export async function searchProducts(query: string): Promise<ProductWithOffers[]> {
  const q = query.trim();
  if (!q) return [];

  const pattern = `%${q}%`;

  const groups = await queryRows<GroupRow>(
    `SELECT DISTINCT g.* FROM product_groups g
     INNER JOIN listings l ON l.group_id = g.id
     WHERE (l.name ILIKE ? OR l.brand ILIKE ? OR g.name ILIKE ? OR g.brand ILIKE ? OR l.ean ILIKE ? OR l.producer_code ILIKE ?)
     AND l.price IS NOT NULL AND l.price > 0
     AND l.store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")})
     ORDER BY g.updated_at DESC
     LIMIT 5000`,
    [
      pattern,
      pattern,
      pattern,
      pattern,
      pattern,
      pattern,
      ...ALLOWED_STORE_IDS_LIST,
    ]
  );

  const result: ProductWithOffers[] = [];

  for (const g of groups) {
    const rows = await queryRows<ListingRow>(
      `SELECT * FROM listings WHERE group_id = ? AND store_id IN (${ALLOWED_STORE_IDS_LIST.map(() => "?").join(",")})`,
      [g.id, ...ALLOWED_STORE_IDS_LIST]
    );
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

export async function getLastSyncTime(): Promise<string | null> {
  const stats = await getSyncStats();
  return stats.lastSync;
}
