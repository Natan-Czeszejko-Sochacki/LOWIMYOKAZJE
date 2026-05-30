-- Uruchom w Supabase: SQL Editor → New query → Run

CREATE TABLE IF NOT EXISTS product_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  slug TEXT NOT NULL,
  image_url TEXT,
  category_id TEXT NOT NULL DEFAULT 'inne',
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  price DOUBLE PRECISION,
  original_price DOUBLE PRECISION,
  lowest_price_30d DOUBLE PRECISION,
  image_url TEXT,
  ean TEXT,
  producer_code TEXT,
  brand TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  previous_price DOUBLE PRECISION,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listings_group ON listings(group_id);
CREATE INDEX IF NOT EXISTS idx_listings_store ON listings(store_id);
CREATE INDEX IF NOT EXISTS idx_listings_group_store ON listings(group_id, store_id);
CREATE INDEX IF NOT EXISTS idx_listings_store_price ON listings(store_id, price);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON product_groups(slug);
CREATE INDEX IF NOT EXISTS idx_groups_category_updated ON product_groups(category_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS slug_aliases (
  alias TEXT PRIMARY KEY,
  canonical_slug TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
