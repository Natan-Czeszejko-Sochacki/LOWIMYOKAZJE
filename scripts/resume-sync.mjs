/**
 * Wznawia synchronizację sklepów, które nie zostały ukończone.
 * Pomija sklepy w pełni zsynchronizowane (domyślnie: carpride, centrum-wedkarskie).
 *
 * npx tsx scripts/resume-sync.mjs
 * npx tsx scripts/resume-sync.mjs e-amur fatfish   # tylko wybrane sklepy
 */
import Database from "better-sqlite3";
import { STORE_CONFIGS } from "../src/lib/store-configs.ts";
import { runCatalogSync } from "../src/lib/catalog-sync.ts";

const SKIP_STORES = new Set(["carpride", "centrum-wedkarskie"]);
const ONLY = process.argv.slice(2);

async function main() {
  const db = new Database("data/catalog.db");
  const counts = Object.fromEntries(
    db
      .prepare("SELECT store_id, COUNT(*) as c FROM listings GROUP BY store_id")
      .all()
      .map((r) => [r.store_id, r.c])
  );
  db.close();

  const before = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`[resume] Stan bazy: ${before.toLocaleString("pl-PL")} ofert`);

  const targets = ONLY.length
    ? STORE_CONFIGS.filter((c) => ONLY.includes(c.id))
    : STORE_CONFIGS.filter((c) => !SKIP_STORES.has(c.id));

  if (targets.length === 0) {
    console.error("[resume] Brak sklepów do synchronizacji.");
    process.exit(1);
  }

  console.log("[resume] Sklepy do pobrania:");
  for (const c of targets) {
    console.log(
      `  - ${c.id} (${c.name}) — obecnie ${(counts[c.id] ?? 0).toLocaleString("pl-PL")} ofert`
    );
  }

  const result = await runCatalogSync({ storeIds: targets.map((c) => c.id) });

  const db2 = new Database("data/catalog.db");
  const after = db2.prepare("SELECT COUNT(*) as c FROM listings").get().c;
  db2.close();

  console.log(
    "\n[resume] Gotowe:",
    JSON.stringify({ ...result, listingsBefore: before, listingsAfter: after }, null, 2)
  );
}

main().catch((e) => {
  console.error("[resume] Błąd:", e);
  process.exit(1);
});
