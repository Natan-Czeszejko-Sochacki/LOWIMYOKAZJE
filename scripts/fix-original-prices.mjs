import Database from "better-sqlite3";
const db = new Database("./data/catalog.db");

// Usuń original_price > 8× ceny (zbyt duże różnice = błąd parsowania)
const r1 = db.prepare(`
  UPDATE listings
  SET original_price = NULL
  WHERE original_price IS NOT NULL
    AND price IS NOT NULL
    AND price > 0
    AND original_price > price * 8
`).run();
console.log("Usunięto original_price > 8× ceny:", r1.changes);

// Usuń original_price <= ceny aktualnej
const r2 = db.prepare(`
  UPDATE listings
  SET original_price = NULL
  WHERE original_price IS NOT NULL
    AND price IS NOT NULL
    AND original_price <= price
`).run();
console.log("Usunięto original_price <= cena:", r2.changes);

const left = db.prepare(`
  SELECT COUNT(*) as c FROM listings WHERE original_price IS NOT NULL AND original_price > price
`).get();
console.log("Pozostało listingów z promocją:", left.c);

// Pokaż próbkę pozostałych promocji - czy wyglądają sensownie?
const sample = db.prepare(`
  SELECT store_id, name, price, original_price,
         ROUND((original_price - price) / original_price * 100) as disc_pct
  FROM listings
  WHERE original_price IS NOT NULL AND original_price > price
  ORDER BY disc_pct DESC
  LIMIT 15
`).all();
console.log("\nPróbka pozostałych promocji:");
sample.forEach(r => console.log(`  [${r.store_id}] ${String(r.name).slice(0,45)} | ${r.price}zł (było ${r.original_price}zł, -${r.disc_pct}%)`));
