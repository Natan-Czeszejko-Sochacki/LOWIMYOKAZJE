process.env.CATALOG_SYNC_LIMIT = process.env.CATALOG_SYNC_LIMIT || "5";

const { runCatalogSync } = await import("../src/lib/catalog-sync.ts");
const { getDb } = await import("../src/lib/db.ts");

const storeId = process.argv[2] || "carpride";
console.log("Test sync:", storeId, "limit", process.env.CATALOG_SYNC_LIMIT);

const r = await runCatalogSync({ storeIds: [storeId] });
console.log("Result:", r);

const rows = getDb()
  .prepare("SELECT url, name, price FROM listings WHERE store_id = ? LIMIT 5")
  .all(storeId);
console.log("Sample listings:", rows);
