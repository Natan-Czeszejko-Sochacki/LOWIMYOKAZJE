/**
 * Przypisuje kategorie do wszystkich product_groups wg nazw grup i ofert.
 * Uruchom: npx tsx scripts/fix-categories.mjs
 */
import Database from "better-sqlite3";
import { resolveProductCategorySlug } from "../src/lib/categories.ts";

const db = new Database("./data/catalog.db");

const groups = db
  .prepare(
    `SELECT g.id, g.name, g.category_id, GROUP_CONCAT(l.name, ' || ') AS listing_names
     FROM product_groups g
     LEFT JOIN listings l ON l.group_id = g.id
     GROUP BY g.id`
  )
  .all();
const update = db.prepare("UPDATE product_groups SET category_id = ? WHERE id = ?");

const stats = {};
const unresolved = [];
const broad = [];
let changed = 0;

const tx = db.transaction(() => {
  for (const g of groups) {
    const listingNames = g.listing_names ? g.listing_names.split(" || ") : [];
    const inferred = resolveProductCategorySlug(null, g.name, ...listingNames);
    const cat =
      inferred === "inne"
        ? resolveProductCategorySlug(g.category_id, g.name, ...listingNames)
        : inferred;
    update.run(cat, g.id);
    stats[cat] = (stats[cat] || 0) + 1;
    if (cat !== g.category_id) changed++;
    if (cat === "inne") unresolved.push(g.name);
    if (["kolowrotki", "wedki", "przynety", "akcesoria-wedkarskie"].includes(cat)) {
      broad.push(`${cat}: ${g.name}`);
    }
  }
});
tx();

console.log(`Przeanalizowano ${groups.length} grup produktów.`);
console.log(`Zmieniono kategorię w ${changed} rekordach.`);
console.log("\nRozkład kategorii:");
Object.entries(stats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => {
    console.log(`  ${k.padEnd(35)} ${v}`);
  });

console.log(`\nNierozpoznane: ${unresolved.length}`);
unresolved.slice(0, 30).forEach((name) => console.log(`  inne: ${name}`));

console.log(`\nNadal ogólne: ${broad.length}`);
broad.slice(0, 30).forEach((name) => console.log(`  ${name}`));
