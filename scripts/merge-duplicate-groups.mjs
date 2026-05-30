const { mergeDuplicateProductGroups, getSyncStats } = await import(
  "../src/lib/db.ts"
);
const { queryRows } = await import("../src/lib/sql.ts");

console.log("Przed scalaniem:", await getSyncStats());

const result = await mergeDuplicateProductGroups();

console.log("Wynik scalania:", result);
console.log("Po scalaniu:", await getSyncStats());

const groups = await queryRows(
  `SELECT g.id, g.slug, COUNT(l.id)::int as offers FROM product_groups g
   JOIN listings l ON l.group_id = g.id
   WHERE g.name LIKE '%T-Force Competition%0%10mm%'
   GROUP BY g.id, g.slug`
);
console.log("\nGrupy Trabucco 0.10mm:", groups);
