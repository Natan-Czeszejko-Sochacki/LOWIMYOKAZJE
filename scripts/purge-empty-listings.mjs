/**
 * Usuwa oferty bez ceny i osierocone grupy produktów.
 * npx tsx scripts/purge-empty-listings.mjs
 */
import { purgeEmptyListings, getSyncStats } from "../src/lib/db.ts";

const before = getSyncStats();
console.log("Przed:", before.listings, "ofert,", before.groups, "grup");

const result = purgeEmptyListings();
const after = getSyncStats();

console.log("Usunięto:", result.listingsRemoved, "ofert,", result.groupsRemoved, "grup");
console.log("Po:", after.listings, "ofert,", after.groups, "grup");
