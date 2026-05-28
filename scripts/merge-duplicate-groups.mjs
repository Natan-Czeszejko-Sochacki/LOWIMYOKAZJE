const { mergeDuplicateProductGroups, getSyncStats } = await import(
  "../src/lib/db.ts"
);

console.log("Przed scalaniem:", getSyncStats());

const result = mergeDuplicateProductGroups();

console.log("Wynik scalania:", result);
console.log("Po scalaniu:", getSyncStats());

const db = (await import("../src/lib/db.ts")).getDb();
const groups = db
  .prepare(
    `SELECT g.id, g.slug, COUNT(l.id) as offers FROM product_groups g
     JOIN listings l ON l.group_id = g.id
     WHERE g.name LIKE '%T-Force Competition%0%10mm%'
     GROUP BY g.id`
  )
  .all();
console.log("\nGrupy Trabucco 0.10mm:", groups);
