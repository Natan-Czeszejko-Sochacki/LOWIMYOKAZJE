import { getSyncStats, type ListingRow } from "./db";
import { queryOne, queryRows } from "./sql";
import { enrichProduct, getHotDeals } from "./price-engine";
import type { ProductWithOffers, StoreOffer, Product } from "./types";
import { ALLOWED_STORE_IDS } from "./store-configs";
import { getCategoryDescendantSlugs, resolveProductCategorySlug } from "./categories";
import { formatManufacturerDisplay, normalizeEan } from "./product-matcher";
import { getStoreById } from "./stores";

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

const LISTING_COLUMNS = `id, group_id, store_id, name, url, price, original_price,
  lowest_price_30d, previous_price, image_url, ean, producer_code, brand, in_stock, updated_at`;

/** Tylko oferty z realną promocją — mniejszy skan niż cała tabela listings. */
export async function getHomepageDealsUncached(): Promise<ProductWithOffers[]> {
  const storeIn = ALLOWED_STORE_IDS_LIST.map(() => "?").join(",");

  const groups = await queryRows<GroupRow>(
    `SELECT g.id, g.name, g.brand, g.slug, g.image_url, g.category_id, g.updated_at
     FROM (
       SELECT l.group_id,
              (MAX(l.original_price) / MIN(l.price)) AS deal_score
       FROM listings l
       WHERE l.store_id IN (${storeIn})
         AND l.price > 0
         AND l.original_price IS NOT NULL
         AND l.original_price > l.price
       GROUP BY l.group_id
       HAVING (MAX(l.original_price) / MIN(l.price)) >= 1.33
       ORDER BY deal_score DESC
       LIMIT 48
     ) hot
     INNER JOIN product_groups g ON g.id = hot.group_id
     ORDER BY hot.deal_score DESC`,
    ALLOWED_STORE_IDS_LIST
  );

  if (groups.length === 0) return [];

  const groupPlaceholders = groups.map(() => "?").join(",");
  const rows = await queryRows<ListingRow>(
    `SELECT ${LISTING_COLUMNS} FROM listings
     WHERE group_id IN (${groupPlaceholders})
       AND store_id IN (${storeIn})
       AND price > 0`,
    [...groups.map((g) => g.id), ...ALLOWED_STORE_IDS_LIST]
  );

  const listingsByGroup = groupRowsByProduct(rows);
  return getHotDeals(groupsToProducts(groups, listingsByGroup, null), 15).slice(0, 12);
}

export async function getHomepageDeals(): Promise<ProductWithOffers[]> {
  return getHomepageDealsUncached();
}

export type SearchListingFilters = {
  q: string;
  store?: string;
  brand?: string;
  minPromo?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: string;
  page?: number;
  limit?: number;
};

export type SearchPageResult = {
  products: ProductWithOffers[];
  totalFiltered: number;
  totalMatches: number;
  storeOptions: { id: string; name: string }[];
  brandOptions: string[];
  currentPage: number;
  totalPages: number;
  tooShort?: boolean;
};

const DEFAULT_SEARCH_LIMIT = 96;

export async function getSearchPageListingUncached(
  filters: SearchListingFilters
): Promise<SearchPageResult> {
  const q = filters.q.trim();
  if (q.length < 2) {
    return {
      products: [],
      totalFiltered: 0,
      totalMatches: 0,
      storeOptions: [],
      brandOptions: [],
      currentPage: 1,
      totalPages: 1,
      tooShort: true,
    };
  }

  const storeIn = ALLOWED_STORE_IDS_LIST.map(() => "?").join(",");
  const limit = filters.limit ?? DEFAULT_SEARCH_LIMIT;
  const page = Math.max(1, filters.page ?? 1);
  const pattern = `%${q}%`;

  const filterParams: unknown[] = [pattern, pattern, pattern, pattern, pattern, pattern];
  const whereExtra: string[] = [];
  const having: string[] = [];

  const textMatch = `(
    g.name ILIKE ? OR COALESCE(g.brand, '') ILIKE ?
    OR l.name ILIKE ? OR COALESCE(l.brand, '') ILIKE ?
    OR COALESCE(l.ean, '') ILIKE ? OR COALESCE(l.producer_code, '') ILIKE ?
  )`;

  if (filters.store?.trim()) {
    whereExtra.push(
      `EXISTS (SELECT 1 FROM listings ls WHERE ls.group_id = g.id AND ls.store_id = ? AND ls.price > 0)`
    );
    filterParams.push(filters.store.trim());
  }
  if (filters.brand?.trim()) {
    const brand = filters.brand.trim();
    whereExtra.push(
      `(LOWER(TRIM(COALESCE(g.brand, l.brand, ''))) = LOWER(?) OR g.name ILIKE ?)`
    );
    filterParams.push(brand, `%${brand}%`);
  }

  const minPromo = filters.minPromo ?? 0;
  if (minPromo > 0) {
    having.push(
      `(MAX(l.original_price) IS NOT NULL AND MAX(l.original_price) > MIN(l.price)
        AND ((MAX(l.original_price) - MIN(l.price)) / MAX(l.original_price) * 100) >= ?)`
    );
    filterParams.push(minPromo);
  }
  if (filters.minPrice != null) {
    having.push(`MIN(l.price) >= ?`);
    filterParams.push(filters.minPrice);
  }
  if (filters.maxPrice != null) {
    having.push(`MIN(l.price) <= ?`);
    filterParams.push(filters.maxPrice);
  }

  const extraSql = whereExtra.length ? `AND ${whereExtra.join(" AND ")}` : "";
  const havingSql = having.length ? `HAVING ${having.join(" AND ")}` : "";
  const groupBy = `g.id, g.name, g.brand, g.slug, g.image_url, g.category_id, g.updated_at`;

  const baseFrom = `
    FROM product_groups g
    INNER JOIN listings l ON l.group_id = g.id
      AND l.store_id IN (${storeIn})
      AND l.price > 0
    WHERE ${textMatch}
    ${extraSql}`;

  const baseParams = [...filterParams, ...ALLOWED_STORE_IDS_LIST];

  const countRow = await queryOne<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM (
      SELECT g.id ${baseFrom}
      GROUP BY ${groupBy}
      ${havingSql}
    ) counted`,
    baseParams
  );
  const totalMatchesRow = await queryOne<{ c: number }>(
    `SELECT COUNT(DISTINCT g.id)::int AS c ${baseFrom}`,
    baseParams
  );

  const totalFiltered = countRow?.c ?? 0;
  const totalMatches = totalMatchesRow?.c ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));
  const currentPage = Math.min(page, totalPages);
  const safeOffset = (currentPage - 1) * limit;

  let orderBy = "g.updated_at DESC";
  switch (filters.sort) {
    case "price-asc":
      orderBy = "MIN(l.price) ASC";
      break;
    case "price-desc":
      orderBy = "MIN(l.price) DESC";
      break;
    case "discount-desc":
      orderBy = `CASE WHEN MAX(l.original_price) > MIN(l.price)
        THEN (MAX(l.original_price) - MIN(l.price)) / MAX(l.original_price)
        ELSE 0 END DESC`;
      break;
    case "stores-desc":
      orderBy = "COUNT(DISTINCT l.store_id) DESC";
      break;
    case "updated-desc":
      orderBy = "MAX(l.updated_at) DESC";
      break;
    case "name-asc":
      orderBy = "g.name ASC";
      break;
  }

  const groups =
    totalFiltered === 0
      ? []
      : await queryRows<GroupRow>(
          `SELECT g.id, g.name, g.brand, g.slug, g.image_url, g.category_id, g.updated_at
           ${baseFrom}
           GROUP BY ${groupBy}
           ${havingSql}
           ORDER BY ${orderBy}
           LIMIT ? OFFSET ?`,
          [...baseParams, limit, safeOffset]
        );

  const listingsByGroup = groupRowsByProduct(
    groups.length > 0
      ? await queryRows<ListingRow>(
          `SELECT ${LISTING_COLUMNS} FROM listings
           WHERE group_id IN (${groups.map(() => "?").join(",")})
             AND store_id IN (${storeIn})
             AND price > 0`,
          [...groups.map((g) => g.id), ...ALLOWED_STORE_IDS_LIST]
        )
      : []
  );

  const products = groupsToProducts(groups, listingsByGroup, null);

  const facetParams = [pattern, pattern, pattern, pattern, pattern, pattern, ...ALLOWED_STORE_IDS_LIST];
  const facetFrom = `
    FROM product_groups g
    INNER JOIN listings l ON l.group_id = g.id
      AND l.store_id IN (${storeIn})
      AND l.price > 0
    WHERE ${textMatch}`;

  const [facetStores, facetBrands] = await Promise.all([
    queryRows<{ store_id: string }>(
      `SELECT DISTINCT l.store_id ${facetFrom}`,
      facetParams
    ),
    queryRows<{ brand: string | null; name: string }>(
      `SELECT DISTINCT g.brand, g.name ${facetFrom}`,
      facetParams
    ),
  ]);

  return {
    products,
    totalFiltered,
    totalMatches,
    storeOptions: facetStores
      .map((r) => ({
        id: r.store_id,
        name: getStoreById(r.store_id)?.name ?? r.store_id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pl")),
    brandOptions: [
      ...new Set(
        facetBrands
          .map((r) => formatManufacturerDisplay(r.brand, r.name) ?? "")
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "pl")),
    currentPage,
    totalPages,
  };
}

/** @deprecated Użyj getSearchPageListing — zachowane dla kompatybilności. */
export async function searchProducts(query: string): Promise<ProductWithOffers[]> {
  const result = await getSearchPageListingUncached({
    q: query,
    page: 1,
    limit: DEFAULT_SEARCH_LIMIT,
  });
  return result.products;
}

export type CategoryListingFilters = {
  q?: string;
  store?: string;
  brand?: string;
  minPromo?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: string;
  page?: number;
  limit?: number;
};

export type CategoryPageResult = {
  products: ProductWithOffers[];
  totalFiltered: number;
  totalInCategory: number;
  storeOptions: { id: string; name: string }[];
  brandOptions: string[];
  currentPage: number;
  totalPages: number;
};

const DEFAULT_CATEGORY_LIMIT = 96;

export async function getCategoryPageListingUncached(
  slug: string,
  filters: CategoryListingFilters
): Promise<CategoryPageResult> {
  const categorySlugs = [...getCategoryDescendantSlugs(slug)];
  const categorySlugsSet = new Set(categorySlugs);
  const storeIn = ALLOWED_STORE_IDS_LIST.map(() => "?").join(",");
  const catIn = categorySlugs.map(() => "?").join(",");
  const limit = filters.limit ?? DEFAULT_CATEGORY_LIMIT;
  const page = Math.max(1, filters.page ?? 1);

  const filterParams: unknown[] = [];
  const whereExtra: string[] = [];
  const having: string[] = [];

  if (filters.q?.trim()) {
    const pattern = `%${filters.q.trim()}%`;
    whereExtra.push(
      `(g.name ILIKE ? OR COALESCE(g.brand, '') ILIKE ? OR l.name ILIKE ? OR COALESCE(l.brand, '') ILIKE ?)`
    );
    filterParams.push(pattern, pattern, pattern, pattern);
  }
  if (filters.store?.trim()) {
    whereExtra.push(
      `EXISTS (SELECT 1 FROM listings ls WHERE ls.group_id = g.id AND ls.store_id = ? AND ls.price > 0)`
    );
    filterParams.push(filters.store.trim());
  }
  if (filters.brand?.trim()) {
    const brand = filters.brand.trim();
    whereExtra.push(
      `(LOWER(TRIM(COALESCE(g.brand, l.brand, ''))) = LOWER(?) OR g.name ILIKE ?)`
    );
    filterParams.push(brand, `%${brand}%`);
  }

  const minPromo = filters.minPromo ?? 0;
  if (minPromo > 0) {
    having.push(
      `(MAX(l.original_price) IS NOT NULL AND MAX(l.original_price) > MIN(l.price)
        AND ((MAX(l.original_price) - MIN(l.price)) / MAX(l.original_price) * 100) >= ?)`
    );
    filterParams.push(minPromo);
  }
  if (filters.minPrice != null) {
    having.push(`MIN(l.price) >= ?`);
    filterParams.push(filters.minPrice);
  }
  if (filters.maxPrice != null) {
    having.push(`MIN(l.price) <= ?`);
    filterParams.push(filters.maxPrice);
  }

  const whereSql = whereExtra.length ? `AND ${whereExtra.join(" AND ")}` : "";
  const havingSql = having.length ? `HAVING ${having.join(" AND ")}` : "";
  const groupBy = `g.id, g.name, g.brand, g.slug, g.image_url, g.category_id, g.updated_at`;

  const baseFrom = `
    FROM product_groups g
    INNER JOIN listings l ON l.group_id = g.id
      AND l.store_id IN (${storeIn})
      AND l.price > 0
    WHERE g.category_id IN (${catIn})
    ${whereSql}`;

  const baseParams = [...categorySlugs, ...ALLOWED_STORE_IDS_LIST, ...filterParams];

  const countRow = await queryOne<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM (
      SELECT g.id ${baseFrom}
      GROUP BY ${groupBy}
      ${havingSql}
    ) counted`,
    baseParams
  );
  const totalFiltered = countRow?.c ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));
  const currentPage = Math.min(page, totalPages);
  const safeOffset = (currentPage - 1) * limit;

  let orderBy = "g.updated_at DESC";
  switch (filters.sort) {
    case "price-asc":
      orderBy = "MIN(l.price) ASC";
      break;
    case "price-desc":
      orderBy = "MIN(l.price) DESC";
      break;
    case "discount-desc":
      orderBy = `CASE WHEN MAX(l.original_price) > MIN(l.price)
        THEN (MAX(l.original_price) - MIN(l.price)) / MAX(l.original_price)
        ELSE 0 END DESC`;
      break;
    case "stores-desc":
      orderBy = "COUNT(DISTINCT l.store_id) DESC";
      break;
    case "updated-desc":
      orderBy = "MAX(l.updated_at) DESC";
      break;
    case "name-asc":
      orderBy = "g.name ASC";
      break;
  }

  const groups =
    totalFiltered === 0
      ? []
      : await queryRows<GroupRow>(
          `SELECT g.id, g.name, g.brand, g.slug, g.image_url, g.category_id, g.updated_at
           ${baseFrom}
           GROUP BY ${groupBy}
           ${havingSql}
           ORDER BY ${orderBy}
           LIMIT ? OFFSET ?`,
          [...baseParams, limit, safeOffset]
        );

  const listingsByGroup = groupRowsByProduct(
    groups.length > 0
      ? await queryRows<ListingRow>(
          `SELECT ${LISTING_COLUMNS} FROM listings
           WHERE group_id IN (${groups.map(() => "?").join(",")})
             AND store_id IN (${storeIn})
             AND price > 0`,
          [...groups.map((g) => g.id), ...ALLOWED_STORE_IDS_LIST]
        )
      : []
  );

  const products = groupsToProducts(groups, listingsByGroup, categorySlugsSet);

  const [facetStores, facetBrands, totalInCategory] = await Promise.all([
    queryRows<{ store_id: string }>(
      `SELECT DISTINCT l.store_id
       FROM listings l
       INNER JOIN product_groups g ON g.id = l.group_id
       WHERE g.category_id IN (${catIn})
         AND l.store_id IN (${storeIn})
         AND l.price > 0`,
      [...categorySlugs, ...ALLOWED_STORE_IDS_LIST]
    ),
    queryRows<{ brand: string | null; name: string }>(
      `SELECT DISTINCT g.brand, g.name
       FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
         AND l.store_id IN (${storeIn})
         AND l.price > 0
       WHERE g.category_id IN (${catIn})`,
      [...categorySlugs, ...ALLOWED_STORE_IDS_LIST]
    ),
    queryOne<{ c: number }>(
      `SELECT COUNT(DISTINCT g.id)::int AS c
       FROM product_groups g
       INNER JOIN listings l ON l.group_id = g.id
         AND l.store_id IN (${storeIn})
         AND l.price > 0
       WHERE g.category_id IN (${catIn})`,
      [...categorySlugs, ...ALLOWED_STORE_IDS_LIST]
    ),
  ]);

  return {
    products,
    totalFiltered,
    totalInCategory: totalInCategory?.c ?? 0,
    storeOptions: facetStores
      .map((r) => ({
        id: r.store_id,
        name: getStoreById(r.store_id)?.name ?? r.store_id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pl")),
    brandOptions: [
      ...new Set(
        facetBrands
          .map((r) => formatManufacturerDisplay(r.brand, r.name) ?? "")
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "pl")),
    currentPage,
    totalPages,
  };
}

export async function getLastSyncTime(): Promise<string | null> {
  const stats = await getSyncStats();
  return stats.lastSync;
}
