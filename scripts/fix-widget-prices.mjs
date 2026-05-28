/**
 * Czyści false-positive original_price z bazy.
 *
 * Problem: parsery HTML stron sklepów (CarpRide, Centrum Wędkarskie)
 * zawierają widgety/banery ze skrzyżowanymi cenami (np. "darmowa dostawa
 * od 22,70 zł") które były błędnie rozpoznawane jako cena przed promocją.
 *
 * Reguły usuwania:
 *  1. Ta sama wartość original_price ≥ 4 razy u tego samego sklepu
 *     → wartość pochodzi z widgetu statycznego (nie z konkretnego produktu)
 *  2. original_price > 4× cena aktualna (>75% zniżki = błąd parsowania)
 *  3. original_price ≤ cena aktualna × 1.05 (różnica <5% = nie jest promocją)
 */

import Database from "better-sqlite3";

const db = new Database("./data/catalog.db");

// ── Reguła 1: wartości powtarzające się ≥4 razy u tego samego sklepu ──────
const widgetValues = db
  .prepare(
    `SELECT store_id, original_price
     FROM listings
     WHERE original_price IS NOT NULL
     GROUP BY store_id, original_price
     HAVING COUNT(*) >= 4`
  )
  .all();

console.log(`Znaleziono ${widgetValues.length} wartości widgetowych do usunięcia.`);

const clearByValue = db.prepare(
  `UPDATE listings SET original_price = NULL
   WHERE store_id = ? AND original_price = ?`
);

const tx1 = db.transaction(() => {
  for (const { store_id, original_price } of widgetValues) {
    clearByValue.run(store_id, original_price);
  }
});
tx1();

// ── Reguła 2: cap 4× aktualnej ceny ───────────────────────────────────────
const r2 = db
  .prepare(
    `UPDATE listings SET original_price = NULL
     WHERE original_price IS NOT NULL
       AND price IS NOT NULL AND price > 0
       AND original_price > price * 4`
  )
  .run();

// ── Reguła 3: różnica <5% to nie jest promocja ────────────────────────────
const r3 = db
  .prepare(
    `UPDATE listings SET original_price = NULL
     WHERE original_price IS NOT NULL
       AND price IS NOT NULL AND price > 0
       AND original_price <= price * 1.05`
  )
  .run();

console.log(`Reguła 2 (>4×): usunięto ${r2.changes} rekordów`);
console.log(`Reguła 3 (<5% różnica): usunięto ${r3.changes} rekordów`);

// ── Podsumowanie ───────────────────────────────────────────────────────────
const remaining = db
  .prepare(
    `SELECT store_id, COUNT(*) as c FROM listings WHERE original_price IS NOT NULL GROUP BY store_id ORDER BY c DESC`
  )
  .all();

console.log("\nPozostałe rekordy z original_price:");
if (remaining.length === 0) {
  console.log("  (brak — wszystko wyczyszczone)");
} else {
  remaining.forEach((r) =>
    console.log(`  ${r.store_id.padEnd(25)} ${r.c}`)
  );
}

// Weryfikacja - pokaż próbkę tego co zostało
const sample = db
  .prepare(
    `SELECT store_id, name, price, original_price,
            ROUND(original_price / price, 1) as ratio
     FROM listings WHERE original_price IS NOT NULL
     ORDER BY ratio DESC LIMIT 20`
  )
  .all();

if (sample.length > 0) {
  console.log("\nPróbka pozostałych (powinny być prawdziwe promocje):");
  sample.forEach((r) =>
    console.log(
      `  ${r.store_id.padEnd(20)} ${("x" + r.ratio).padEnd(6)} ${String(r.price.toFixed(2)).padEnd(10)} ${String(r.original_price.toFixed(2)).padEnd(10)} ${r.name.substring(0, 45)}`
    )
  );
}
