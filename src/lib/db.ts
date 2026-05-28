import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  ProductIdentityIndex,
  formatManufacturerDisplay,
  normalizeProducerCode,
  normalizeProductName,
} from "./product-matcher";
import { inferCategorySlug, resolveProductCategorySlug } from "./categories";

const DB_PATH = path.join(process.cwd(), "data", "catalog.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS product_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      slug TEXT NOT NULL,
      image_url TEXT,
      category_id TEXT DEFAULT 'inne',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      price REAL,
      original_price REAL,
      image_url TEXT,
      ean TEXT,
      producer_code TEXT,
      brand TEXT,
      in_stock INTEGER DEFAULT 1,
      previous_price REAL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (group_id) REFERENCES product_groups(id)
    );

    CREATE INDEX IF NOT EXISTS idx_listings_group ON listings(group_id);
    CREATE INDEX IF NOT EXISTS idx_listings_store ON listings(store_id);
    CREATE INDEX IF NOT EXISTS idx_listings_group_store ON listings(group_id, store_id);
    CREATE INDEX IF NOT EXISTS idx_listings_store_price ON listings(store_id, price);
    CREATE INDEX IF NOT EXISTS idx_groups_slug ON product_groups(slug);
    CREATE INDEX IF NOT EXISTS idx_groups_category_updated ON product_groups(category_id, updated_at);

    CREATE TABLE IF NOT EXISTS slug_aliases (
      alias TEXT PRIMARY KEY,
      canonical_slug TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  ensureColumn(database, "listings", "producer_code", "TEXT");
  ensureColumn(database, "listings", "previous_price", "REAL");
  ensureColumn(database, "listings", "lowest_price_30d", "REAL");

  // Migracja: napraw istniejące slugi zawierające znaki niedozwolone w URL (np. ':')
  database.exec(
    `UPDATE product_groups SET slug = REPLACE(slug, ':', '') WHERE slug LIKE '%:%'`
  );
}

function ensureColumn(
  database: Database.Database,
  table: string,
  column: string,
  definition: string
) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (!columns.some((c) => c.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

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
  in_stock: number;
  updated_at: string;
};

export function upsertListing(listing: {
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
  const database = getDb();
  const now = new Date().toISOString();
  const slug = buildProductSlug(listing.name, listing.groupId);
  const producerCode = normalizeProducerCode(listing.producerCode);
  const brand = formatManufacturerDisplay(listing.brand, listing.name);
  const inferredCategory = listing.categoryId ?? inferCategorySlug(listing.name);
  const existing = database
    .prepare("SELECT category_id FROM product_groups WHERE id = ?")
    .get(listing.groupId) as { category_id: string } | undefined;
  const categoryId = resolveProductCategorySlug(
    existing?.category_id,
    inferredCategory,
    listing.name
  );

  database
    .prepare(
      `INSERT INTO product_groups (id, name, brand, slug, image_url, category_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         brand = COALESCE(excluded.brand, product_groups.brand),
         slug = excluded.slug,
         image_url = COALESCE(excluded.image_url, product_groups.image_url),
         category_id = excluded.category_id,
         updated_at = excluded.updated_at`
    )
    .run(
      listing.groupId,
      listing.name,
      brand,
      slug,
      listing.imageUrl,
      categoryId,
      now
    );

  database
    .prepare(
      `INSERT INTO listings (id, group_id, store_id, name, url, price, original_price, lowest_price_30d, image_url, ean, producer_code, brand, in_stock, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         url = excluded.url,
         previous_price = CASE
           WHEN excluded.price IS NOT NULL
                AND listings.price IS NOT NULL
                AND excluded.price != listings.price
           THEN listings.price
           ELSE listings.previous_price
         END,
         price = excluded.price,
         original_price = excluded.original_price,
         lowest_price_30d = COALESCE(excluded.lowest_price_30d, listings.lowest_price_30d),
         image_url = COALESCE(excluded.image_url, listings.image_url),
         ean = COALESCE(excluded.ean, listings.ean),
         producer_code = COALESCE(excluded.producer_code, listings.producer_code),
         brand = COALESCE(excluded.brand, listings.brand),
         in_stock = excluded.in_stock,
         updated_at = excluded.updated_at`
    )
    .run(
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
      listing.inStock ? 1 : 0,
      now
    );

  removeDuplicateStoreOffers(database, {
    id: listing.id,
    groupId: listing.groupId,
    storeId: listing.storeId,
    name: listing.name,
  });
}

function removeDuplicateStoreOffers(
  database: Database.Database,
  listing: {
    id: string;
    groupId: string;
    storeId: string;
    name: string;
  }
) {
  const nameKey = normalizeProductName(listing.name);
  if (!nameKey) return;

  const candidates = database
    .prepare(
      `SELECT id, name FROM listings
       WHERE group_id = ? AND store_id = ? AND id != ?`
    )
    .all(listing.groupId, listing.storeId, listing.id) as {
    id: string;
    name: string;
  }[];

  const duplicates = candidates.filter(
    (row) => normalizeProductName(row.name) === nameKey
  );
  if (duplicates.length === 0) return;

  const deleteStmt = database.prepare("DELETE FROM listings WHERE id = ?");
  for (const duplicate of duplicates) {
    deleteStmt.run(duplicate.id);
  }
}

/** Zwraca Set URL-i zaktualizowanych w ciągu ostatnich `maxAgeHours` godzin dla danego sklepu. */
export function getRecentlyUpdatedUrls(storeId: string, maxAgeHours = 6): Set<string> {
  const database = getDb();
  const since = new Date(Date.now() - maxAgeHours * 3_600_000).toISOString();
  const rows = database
    .prepare(
      `SELECT url FROM listings
       WHERE store_id = ? AND updated_at > ?
         AND price IS NOT NULL AND price > 0`
    )
    .all(storeId, since) as { url: string }[];
  return new Set(rows.map((r) => r.url.split("?")[0]));
}

export function deleteListings(ids: string[]): number {
  if (ids.length === 0) return 0;
  const database = getDb();
  const stmt = database.prepare("DELETE FROM listings WHERE id = ?");
  const tx = database.transaction(() => {
    for (const id of ids) stmt.run(id);
  });
  tx();
  return ids.length;
}

/** Usuwa oferty bez ceny i osierocone grupy produktów. */
export function purgeEmptyListings(): { listingsRemoved: number; groupsRemoved: number } {
  const database = getDb();
  const listingsRemoved = database
    .prepare("DELETE FROM listings WHERE price IS NULL OR price <= 0")
    .run().changes;
  const groupsRemoved = database
    .prepare(
      `DELETE FROM product_groups
       WHERE id NOT IN (SELECT DISTINCT group_id FROM listings)`
    )
    .run().changes;
  return { listingsRemoved, groupsRemoved };
}

/** Zapisuje listę listingów w jednej transakcji SQLite — znacznie szybsze niż pojedyncze upserty. */
export function batchUpsertListings(
  listings: Parameters<typeof upsertListing>[0][]
): void {
  const database = getDb();
  const tx = database.transaction(() => {
    for (const l of listings) upsertListing(l);
  });
  tx();
}

/**
 * Usuwa błędnie sparsowane "ceny przed promocją" z bazy:
 * 1. Wartości powtarzające się ≥4 razy u tego samego sklepu — origin: widgety/bannery
 * 2. original_price > 4× ceny aktualnej (>75% zniżki = błąd parsera)
 * 3. original_price ≤ 1.05× ceny aktualnej (różnica <5% = nie jest promocją)
 */
export function cleanWidgetPrices(): number {
  const database = getDb();
  let total = 0;

  // Reguła 1: wartości widgetowe — ta sama kwota ≥4 razy u jednego sklepu
  const widgetValues = database
    .prepare(
      `SELECT store_id, original_price FROM listings
       WHERE original_price IS NOT NULL
       GROUP BY store_id, original_price HAVING COUNT(*) >= 4`
    )
    .all() as { store_id: string; original_price: number }[];

  if (widgetValues.length > 0) {
    const clearStmt = database.prepare(
      `UPDATE listings SET original_price = NULL WHERE store_id = ? AND original_price = ?`
    );
    const tx = database.transaction(() => {
      for (const { store_id, original_price } of widgetValues) {
        const r = clearStmt.run(store_id, original_price);
        total += r.changes;
      }
    });
    tx();
  }

  // Reguła 2: >4× ceny aktualnej
  const r2 = database
    .prepare(
      `UPDATE listings SET original_price = NULL
       WHERE original_price IS NOT NULL AND price IS NOT NULL AND price > 0
         AND original_price > price * 4`
    )
    .run();
  total += r2.changes;

  // Reguła 3: różnica <5%
  const r3 = database
    .prepare(
      `UPDATE listings SET original_price = NULL
       WHERE original_price IS NOT NULL AND price IS NOT NULL AND price > 0
         AND original_price <= price * 1.05`
    )
    .run();
  total += r3.changes;

  return total;
}

/**
 * Łączy zduplikowane grupy produktów (ten sam kod producenta / EAN / nazwa)
 * i przebudowuje product_groups. Uruchamiane po sync i jednorazowo na istniejącej bazie.
 */
export function mergeDuplicateProductGroups(): {
  listingsUpdated: number;
  groupsRemoved: number;
} {
  const database = getDb();
  type ListingIdentityRow = {
    id: string;
    group_id: string;
    name: string;
    ean: string | null;
    producer_code: string | null;
    brand: string | null;
  };

  const rows = database
    .prepare(
      "SELECT id, group_id, name, ean, producer_code, brand, image_url FROM listings"
    )
    .all() as (ListingIdentityRow & { image_url: string | null })[];

  const oldGroups = database
    .prepare(
      `SELECT g.id, g.slug, g.name, g.brand, g.image_url, g.category_id,
              COUNT(l.id) AS listing_count
       FROM product_groups g
       LEFT JOIN listings l ON l.group_id = g.id
       GROUP BY g.id`
    )
    .all() as {
    id: string;
    slug: string;
    name: string;
    brand: string | null;
    image_url: string | null;
    category_id: string;
    listing_count: number;
  }[];

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
  const groupListingRows = new Map<string, typeof rows>();
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

  const tx = database.transaction(() => {
    database.pragma("foreign_keys = OFF");

    const upsertGroup = database.prepare(
      `INSERT INTO product_groups (id, name, brand, slug, image_url, category_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         brand = COALESCE(excluded.brand, product_groups.brand),
         slug = excluded.slug,
         image_url = COALESCE(excluded.image_url, product_groups.image_url),
         category_id = COALESCE(excluded.category_id, product_groups.category_id),
         updated_at = excluded.updated_at`
    );

    const now = new Date().toISOString();
    for (const groupId of canonicalIds) {
      const groupRows = groupListingRows.get(groupId) ?? [];
      if (groupRows.length === 0) continue;

      const best = groupRows.find((l) => l.image_url) ?? groupRows[0];
      const oldMeta = oldGroups.find((g) => canonicalByOldGroup.get(g.id) === groupId);
      const slug =
        preferredSlug.get(groupId) ??
        oldMeta?.slug ??
        buildProductSlug(best.name, groupId);

      upsertGroup.run(
        groupId,
        best.name,
        best.brand ?? oldMeta?.brand ?? null,
        slug,
        best.image_url ?? oldMeta?.image_url ?? null,
        resolveProductCategorySlug(oldMeta?.category_id, best.name),
        now
      );
    }

    const updateStmt = database.prepare(
      "UPDATE listings SET group_id = ? WHERE id = ?"
    );
    for (const u of listingUpdates) {
      updateStmt.run(u.groupId, u.id);
      listingsUpdated++;
    }

    const orphanResult = database
      .prepare(
        `DELETE FROM product_groups
         WHERE id NOT IN (SELECT DISTINCT group_id FROM listings)`
      )
      .run();
    groupsRemoved = orphanResult.changes;

    database.pragma("foreign_keys = ON");
  });

  tx();

  // Przekierowania starych slugów → kanoniczny slug
  database.exec(`
    CREATE TABLE IF NOT EXISTS slug_aliases (
      alias TEXT PRIMARY KEY,
      canonical_slug TEXT NOT NULL
    )
  `);
  const aliasStmt = database.prepare(
    `INSERT OR IGNORE INTO slug_aliases (alias, canonical_slug) VALUES (?, ?)`
  );
  const aliasTx = database.transaction(() => {
    for (const g of oldGroups) {
      const canonicalId = canonicalByOldGroup.get(g.id) ?? g.id;
      const canonicalSlug =
        preferredSlug.get(canonicalId) ?? buildProductSlug(g.name, canonicalId);
      if (g.slug !== canonicalSlug) {
        aliasStmt.run(g.slug, canonicalSlug);
      }
    }
  });
  aliasTx();

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

export function rebuildFts() {
  const database = getDb();
  try {
    database.exec(`DROP TABLE IF EXISTS listings_fts`);
    database.exec(`
      CREATE VIRTUAL TABLE listings_fts USING fts5(
        name,
        brand,
        content='listings',
        content_rowid='rowid'
      );
      INSERT INTO listings_fts(rowid, name, brand)
      SELECT rowid, name, brand FROM listings;
    `);
  } catch {
    /* FTS opcjonalne — wyszukiwanie działa przez LIKE */
  }
}

export function getSyncStats() {
  const database = getDb();
  const listings = database.prepare("SELECT COUNT(*) as c FROM listings").get() as {
    c: number;
  };
  const groups = database.prepare("SELECT COUNT(*) as c FROM product_groups").get() as {
    c: number;
  };
  const last = database
    .prepare("SELECT MAX(updated_at) as t FROM listings")
    .get() as { t: string | null };
  return {
    listings: listings.c,
    groups: groups.c,
    lastSync: last.t,
  };
}
