/**
 * Jednorazowy import data/catalog.db → Supabase (Postgres).
 *
 * Wymaga:
 * 1. Uruchomiony schemat: supabase/migrations/001_schema.sql w SQL Editor
 * 2. W .env.local: DIRECT_DATABASE_URL (Connect → Direct, port 5432)
 *
 * Uruchom: npm run db:migrate
 */
import Database from "better-sqlite3";
import postgres from "postgres";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "catalog.db");
const BATCH = 500;

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const baseUrl =
  process.env.DIRECT_DATABASE_URL ||
  process.env.DATABASE_URL;
if (!baseUrl) {
  console.error(
    "Brak DIRECT_DATABASE_URL w .env.local (Supabase → Connect → Direct connection, port 5432)"
  );
  process.exit(1);
}

function resolvePostgresConfig(url) {
  const password = (
    process.env.DIRECT_DATABASE_PASSWORD ||
    process.env.DATABASE_PASSWORD ||
    ""
  ).trim();
  if (!password) return url;

  const parsed = new URL(url);
  const isSupabase = url.includes("supabase");
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    database: parsed.pathname.replace(/^\//, "") || "postgres",
    username: decodeURIComponent(parsed.username),
    password,
    ssl: isSupabase ? "require" : undefined,
    max: 1,
  };
}

const pgConfig = resolvePostgresConfig(baseUrl);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

if (!fs.existsSync(DB_PATH)) {
  console.error(`Brak pliku ${DB_PATH} — najpierw zsynchronizuj katalog lokalnie.`);
  process.exit(1);
}

const sqlite = new Database(DB_PATH, { readonly: true });
const sql = postgres(pgConfig);

function boolStock(v) {
  return v === 1 || v === true;
}

async function insertBatch(table, rows, build) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const values = chunk.map((r) => build(r));
    const cols = Object.keys(values[0]);
    const placeholders = values
      .map(
        (_, ri) =>
          `(${cols.map((_, ci) => `$${ri * cols.length + ci + 1}`).join(",")})`
      )
      .join(",");
    const flat = values.flatMap((v) => cols.map((c) => v[c]));
    await sql.unsafe(
      `INSERT INTO ${table} (${cols.join(",")}) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
      flat
    );
    process.stdout.write(`  ${table}: ${Math.min(i + BATCH, rows.length)}/${rows.length}\r`);
  }
  console.log(`  ${table}: ${rows.length} wierszy`);
}

try {
  console.log("Import z", DB_PATH);

  const groups = sqlite
    .prepare("SELECT * FROM product_groups")
    .all();
  await insertBatch("product_groups", groups, (g) => ({
    id: g.id,
    name: g.name,
    brand: g.brand,
    slug: g.slug.replace(/:/g, ""),
    image_url: g.image_url,
    category_id: g.category_id ?? "inne",
    updated_at: g.updated_at,
  }));

  const listings = sqlite.prepare("SELECT * FROM listings").all();
  for (let i = 0; i < listings.length; i += BATCH) {
    const chunk = listings.slice(i, i + BATCH);
    const cols = [
      "id",
      "group_id",
      "store_id",
      "name",
      "url",
      "price",
      "original_price",
      "lowest_price_30d",
      "image_url",
      "ean",
      "producer_code",
      "brand",
      "in_stock",
      "previous_price",
      "updated_at",
    ];
    const placeholders = chunk
      .map(
        (_, ri) =>
          `(${cols.map((_, ci) => `$${ri * cols.length + ci + 1}`).join(",")})`
      )
      .join(",");
    const flat = chunk.flatMap((l) => [
      l.id,
      l.group_id,
      l.store_id,
      l.name,
      l.url,
      l.price,
      l.original_price,
      l.lowest_price_30d ?? null,
      l.image_url,
      l.ean,
      l.producer_code,
      l.brand,
      boolStock(l.in_stock),
      l.previous_price ?? null,
      l.updated_at,
    ]);
    await sql.unsafe(
      `INSERT INTO listings (${cols.join(",")}) VALUES ${placeholders}
       ON CONFLICT (id) DO UPDATE SET
         price = EXCLUDED.price,
         original_price = EXCLUDED.original_price,
         updated_at = EXCLUDED.updated_at`,
      flat
    );
    process.stdout.write(
      `  listings: ${Math.min(i + BATCH, listings.length)}/${listings.length}\r`
    );
  }
  console.log(`  listings: ${listings.length} wierszy`);

  const aliases = sqlite
    .prepare("SELECT alias, canonical_slug FROM slug_aliases")
    .all();
  if (aliases.length > 0) {
    await insertBatch("slug_aliases", aliases, (a) => ({
      alias: a.alias,
      canonical_slug: a.canonical_slug,
    }));
  }

  const stats = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM product_groups) AS groups,
      (SELECT COUNT(*)::int FROM listings) AS listings
  `;
  console.log("Supabase po imporcie:", stats[0]);
} finally {
  sqlite.close();
  await sql.end();
}
