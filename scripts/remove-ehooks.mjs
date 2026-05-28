import Database from "better-sqlite3";
const db = new Database("./data/catalog.db");

const listings = db.prepare("DELETE FROM listings WHERE store_id = 'ehooks'").run();
console.log("Usunięto listingów ehooks:", listings.changes);

// Usuń grupy produktów, które nie mają już żadnych listingów
const orphans = db.prepare(`
  DELETE FROM product_groups
  WHERE id NOT IN (SELECT DISTINCT group_id FROM listings)
`).run();
console.log("Usunięto osieroconych grup:", orphans.changes);

// Przebuduj FTS
try {
  db.exec("DELETE FROM product_search_fts; INSERT INTO product_search_fts SELECT id, name FROM product_groups;");
  console.log("FTS odbudowane.");
} catch (e) {
  console.log("FTS skip:", e.message);
}

const total = db.prepare("SELECT COUNT(*) as c FROM listings").get();
const groups = db.prepare("SELECT COUNT(*) as c FROM product_groups").get();
console.log("Pozostało listingów:", total.c, "| grup:", groups.c);
