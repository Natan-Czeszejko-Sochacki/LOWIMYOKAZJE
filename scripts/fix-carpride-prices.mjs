import Database from "better-sqlite3";
const db = new Database("./data/catalog.db");

// Wyczyść wszystkie original_price z CarpRide — wszystkie pochodziły z widgetu/baneru na stronie
const r1 = db.prepare(`UPDATE listings SET original_price = NULL WHERE store_id = 'carpride'`).run();
console.log("Wyczyszczono original_price CarpRide:", r1.changes);

// Wyczyść też te same stałe wartości z innych sklepów (na wypadek gdyby ten sam widget był gdzieś indziej)
const r2 = db.prepare(`
  UPDATE listings
  SET original_price = NULL
  WHERE original_price IN (22.7, 49.9, 49.99, 319.99, 22.70)
`).run();
console.log("Wyczyszczono podejrzane stałe wartości widgetowe:", r2.changes);

// Usuń resztę powyżej 8× ceny
const r3 = db.prepare(`
  UPDATE listings
  SET original_price = NULL
  WHERE original_price IS NOT NULL
    AND price IS NOT NULL AND price > 0
    AND original_price > price * 8
`).run();
console.log("Usunięto original_price > 8× ceny:", r3.changes);

const left = db.prepare(`SELECT COUNT(*) as c FROM listings WHERE original_price IS NOT NULL AND original_price > price`).get();
console.log("\nPozostało listingów z promocją:", left.c);

const sample = db.prepare(`
  SELECT store_id, name, price, original_price,
         ROUND((original_price - price) / original_price * 100) as disc
  FROM listings WHERE original_price IS NOT NULL AND original_price > price
  ORDER BY disc DESC LIMIT 10
`).all();
console.log("Próbka:");
sample.forEach(r => console.log(`  [${r.store_id}] ${String(r.name).slice(0,50)} | ${r.price}zł było ${r.original_price}zł (-${r.disc}%)`));
