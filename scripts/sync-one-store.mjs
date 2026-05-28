/**
 * Synchronizacja jednego sklepu (test):
 * node scripts/sync-one-store.mjs carpride
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const storeId = process.argv[2] || "carpride";

async function main() {
  const { register } = await import("tsx/esm/api");
  register();

  const { runCatalogSync } = await import("../src/lib/catalog-sync.ts");
  console.log("Sync sklepu:", storeId);
  const r = await runCatalogSync({ storeIds: [storeId] });
  console.log(JSON.stringify(r, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
