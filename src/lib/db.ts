import {
  ProductIdentityIndex,
  formatManufacturerDisplay,
  normalizeProducerCode,
  normalizeProductName,
} from "./product-matcher";
import { inferCategorySlug, resolveProductCategorySlug } from "./categories";
import { execute, queryOne, queryRows, withTransaction } from "./sql";

export type ListingRow = {
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
  in_stock: boolean | number;
  updated_at: string;
};

export async function upsertListing(listing: {
  id: string;
  groupId: string;
  storeId: string;
  name: string;
  url: string;
  price: number | null;
  originalPrice?: number | null;
  lowestPrice30d?: number | null;
  imageUrl?: string | null;
  ean?: string | null;
  producerCode?: string | null;
  brand?: string | null;
  inStock: boolean;
  categoryId?: string;
}) {
  const now = new Date().toISOString();
  const slug = buildProductSlug(listing.name, listing.groupId);
  const producerCode = normalizeProducerCode(listing.producerCode);
  const brand = formatManufacturerDisplay(listing.brand, listing.name);
  const inferredCategory = listing.categoryId ?? inferCategorySlug(listing.name);
  const existing = await queryOne<{ category_id: string }>(
    "SELECT category_id FROM product_groups WHERE id = ?",
    [listing.groupId]
  );
  const categoryId = resolveProductCategorySlug(
    existing?.category_id,
    inferredCategory,
    listing.name
  );

  await execute(
    `INSERT INTO product_groups (id, name, brand, slug, image_url, category_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = EXCLUDED.name,
       brand = COALESCE(EXCLUDED.brand, product_groups.brand),
       slug = EXCLUDED.slug,
       image_url = COALESCE(EXCLUDED.image_url, product_groups.image_url),
       category_id = EXCLUDED.category_id,
       updated_at = EXCLUDED.updated_at`,
    [
      listing.groupId,
      listing.name,
      brand,
      slug,
      listing.imageUrl,
      categoryId,
      now,
    ]
  );

  await execute(
    `INSERT INTO listings (id, group_id, store_id, name, url, price, original_price, lowest_price_30d, image_url, ean, producer_code, brand, in_stock, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = EXCLUDED.name,
       url = EXCLUDED.url,
       previous_price = CASE
         WHEN EXCLUDED.price IS NOT NULL
              AND listings.price IS NOT NULL
              AND EXCLUDED.price != listings.price
         THEN listings.price
         ELSE listings.previous_price
       END,
       price = EXCLUDED.price,
       original_price = EXCLUDED.original_price,
       lowest_price_30d = COALESCE(EXCLUDED.lowest_price_30d, listings.lowest_price_30d),
       image_url = COALESCE(EXCLUDED.image_url, listings.image_url),
       ean = COALESCE(EXCLUDED.ean, listings.ean),
       producer_code = COALESCE(EXCLUDED.producer_code, listings.producer_code),
       brand = COALESCE(EXCLUDED.brand, listings.brand),
       in_stock = EXCLUDED.in_stock,
       updated_at = EXCLUDED.updated_at`,
    [
      listing.id,
      listing.groupId,
      listing.storeId,
      listing.name,
      listing.url,
      listing.price,
      listing.originalPrice ?? null,
      listing.lowestPrice30d ?? null,
      listing.imageUrl ?? null,
      listing.ean ?? null,
      producerCode,
      brand,
      listing.inStock,
      now,
    ]
  );

  await removeDuplicateStoreOffers({
    id: listing.id,
    groupId: listing.groupId,
    storeId: listing.storeId,
    name: listing.name,
  });
}

async function removeDuplicateStoreOffers(listing: {
  id: string;
  groupId: string;
  storeId: string;
  name: string;
}) {
  const nameKey = normalizeProductName(listing.name);
  if (!nameKey) return;

  const candidates = await queryRows<{ id: string; name: string }>(
    `SELECT id, name FROM listings
     WHERE group_id = ? AND store_id = ? AND id != ?`,
    [listing.groupId, listing.storeId, listing.id]
  );

  const duplicates = candidates.filter(
    (row) => normalizeProductName(row.name) === nameKey
  );
  if (duplicates.length === 0) return;

  for (const duplicate of duplicates) {
    await execute("DELETE FROM listings WHERE id = ?", [duplicate.id]);
  }
}

export async function getRecentlyUpdatedUrls(
  storeId: string,
  maxAgeHours = 6
): Promise<Set<string>> {
  const since = new Date(Date.now() - maxAgeHours * 3_600_000).toISOString();
  const rows = await queryRows<{ url: string }>(
    `SELECT url FROM listings
     WHERE store_id = ? AND updated_at > ?
       AND price IS NOT NULL AND price > 0`,
    [storeId, since]
  );
  return new Set(rows.map((r) => r.url.split("?")[0]));
}

export async function deleteListings(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  for (const id of ids) {
    await execute("DELETE FROM listings WHERE id = ?", [id]);
  }
  return ids.length;
}

export async function purgeEmptyListings(): Promise<{
  listingsRemoved: number;
  groupsRemoved: number;
}> {
  const listingsRemoved = await execute(
    "DELETE FROM listings WHERE price IS NULL OR price <= 0"
  );
  const groupsRemoved = await execute(
    `DELETE FROM product_groups
     WHERE id NOT IN (SELECT DISTINCT group_id FROM listings)`
  );
  return { listingsRemoved, groupsRemoved };
}

export async function batchUpsertListings(
  listings: Parameters<typeof upsertListing>[0][]
): Promise<void> {
  for (const l of listings) {
    await upsertListing(l);
  }
}

export async function cleanWidgetPrices(): Promise<number> {
  let total = 0;

  const widgetValues = await queryRows<{
    store_id: string;
    original_price: number;
  }>(
    `SELECT store_id, original_price FROM listings
     WHERE original_price IS NOT NULL
     GROUP BY store_id, original_price HAVING COUNT(*) >= 4`
  );

  for (const { store_id, original_price } of widgetValues) {
    total += await execute(
      `UPDATE listings SET original_price = NULL WHERE store_id = ? AND original_price = ?`,
      [store_id, original_price]
    );
  }

  total += await execute(
    `UPDATE listings SET original_price = NULL
     WHERE original_price IS NOT NULL AND price IS NOT NULL AND price > 0
       AND original_price > price * 4`
  );

  total += await execute(
    `UPDATE listings SET original_price = NULL
     WHERE original_price IS NOT NULL AND price IS NOT NULL AND price > 0
       AND original_price <= price * 1.05`
  );

  return total;
}

export async function mergeDuplicateProductGroups(): Promise<{
  listingsUpdated: number;
  groupsRemoved: number;
}> {
  type ListingIdentityRow = {
    id: string;
    group_id: string;
    name: string;
    ean: string | null;
    producer_code: string | null;
    brand: string | null;
    image_url: string | null;
  };

  const rows = await queryRows<ListingIdentityRow>(
    "SELECT id, group_id, name, ean, producer_code, brand, image_url FROM listings"
  );

  const oldGroups = await queryRows<{
    id: string;
    slug: string;
    name: string;
    brand: string | null;
    image_url: string | null;
    category_id: string;
    listing_count: number;
  }>(
    `SELECT g.id, g.slug, g.name, g.brand, g.image_url, g.category_id,
            COUNT(l.id)::int AS listing_count
     FROM product_groups g
     LEFT JOIN listings l ON l.group_id = g.id
     GROUP BY g.id, g.slug, g.name, g.brand, g.image_url, g.category_id`
  );

  const index = new ProductIdentityIndex();
  const canonicalByOldGroup = new Map<string, string>();
  const canonicalByListing = new Map<string, string>();
  const listingUpdates: { id: string; groupId: string }[] = [];

  for (const row of rows) {
    const canonicalId = index.resolve({
      name: row.name,
      brand: row.brand,
      ean: row.ean,
      producerCode: row.producer_code,
    });
    canonicalByListing.set(row.id, canonicalId);
    canonicalByOldGroup.set(row.group_id, canonicalId);
    if (canonicalId !== row.group_id) {
      listingUpdates.push({ id: row.id, groupId: canonicalId });
    }
  }

  const canonicalIds = [...new Set(canonicalByListing.values())];
  const groupListingRows = new Map<string, ListingIdentityRow[]>();
  for (const row of rows) {
    const canonicalId = canonicalByListing.get(row.id)!;
    const bucket = groupListingRows.get(canonicalId) ?? [];
    bucket.push(row);
    groupListingRows.set(canonicalId, bucket);
  }

  const preferredSlug = new Map<string, string>();
  for (const g of oldGroups) {
    const canonicalId = canonicalByOldGroup.get(g.id) ?? g.id;
    const existingSlug = preferredSlug.get(canonicalId);
    const existingGroup = existingSlug
      ? oldGroups.find((og) => og.slug === existingSlug)
      : null;
    if (!existingSlug || g.listing_count > (existingGroup?.listing_count ?? 0)) {
      preferredSlug.set(canonicalId, g.slug);
    }
  }

  let listingsUpdated = 0;
  let groupsRemoved = 0;
  const now = new Date().toISOString();

  await withTransaction(async (tx) => {
    for (const groupId of canonicalIds) {
      const groupRows = groupListingRows.get(groupId) ?? [];
      if (groupRows.length === 0) continue;

      const best = groupRows.find((l) => l.image_url) ?? groupRows[0];
      const oldMeta = oldGroups.find((g) => canonicalByOldGroup.get(g.id) === groupId);
      const slug =
        preferredSlug.get(groupId) ??
        oldMeta?.slug ??
        buildProductSlug(best.name, groupId);

      await tx.unsafe(
        `INSERT INTO product_groups (id, name, brand, slug, image_url, category_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT(id) DO UPDATE SET
           name = EXCLUDED.name,
           brand = COALESCE(EXCLUDED.brand, product_groups.brand),
           slug = EXCLUDED.slug,
           image_url = COALESCE(EXCLUDED.image_url, product_groups.image_url),
           category_id = COALESCE(EXCLUDED.category_id, product_groups.category_id),
           updated_at = EXCLUDED.updated_at`,
        [
          groupId,
          best.name,
          best.brand ?? oldMeta?.brand ?? null,
          slug,
          best.image_url ?? oldMeta?.image_url ?? null,
          resolveProductCategorySlug(oldMeta?.category_id, best.name),
          now,
        ]
      );
    }

    for (const u of listingUpdates) {
      await tx.unsafe("UPDATE listings SET group_id = $1 WHERE id = $2", [
        u.groupId,
        u.id,
      ]);
      listingsUpdated++;
    }

    const orphan = await tx.unsafe(
      `DELETE FROM product_groups
       WHERE id NOT IN (SELECT DISTINCT group_id FROM listings)`
    );
    groupsRemoved = orphan.count ?? 0;
  });

  for (const g of oldGroups) {
    const canonicalId = canonicalByOldGroup.get(g.id) ?? g.id;
    const canonicalSlug =
      preferredSlug.get(canonicalId) ?? buildProductSlug(g.name, canonicalId);
    if (g.slug !== canonicalSlug) {
      await execute(
        `INSERT INTO slug_aliases (alias, canonical_slug) VALUES (?, ?)
         ON CONFLICT (alias) DO NOTHING`,
        [g.slug, canonicalSlug]
      );
    }
  }

  return { listingsUpdated, groupsRemoved };
}

function buildProductSlug(name: string, groupId: string): string {
  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80);
  const groupSuffix = groupId
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toLowerCase();
  return `${slugBase}-${groupSuffix}`;
}

export async function rebuildFts(): Promise<void> {
  /* FTS tylko w SQLite; wyszukiwanie w Postgres przez LIKE */
}

export async function getSyncStats(): Promise<{
  listings: number;
  groups: number;
  lastSync: string | null;
}> {
  const listings = await queryOne<{ c: number }>(
    "SELECT COUNT(*)::int AS c FROM listings"
  );
  const groups = await queryOne<{ c: number }>(
    "SELECT COUNT(*)::int AS c FROM product_groups"
  );
  const last = await queryOne<{ t: string | null }>(
    "SELECT MAX(updated_at)::text AS t FROM listings"
  );
  return {
    listings: listings?.c ?? 0,
    groups: groups?.c ?? 0,
    lastSync: last?.t ?? null,
  };
}
