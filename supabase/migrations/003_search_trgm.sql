-- Szybkie wyszukiwanie ILIKE %fraza% (uruchom w SQL Editor)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_listings_name_trgm
  ON listings USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_listings_brand_trgm
  ON listings USING gin (brand gin_trgm_ops)
  WHERE brand IS NOT NULL AND brand <> '';

CREATE INDEX IF NOT EXISTS idx_groups_name_trgm
  ON product_groups USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_groups_brand_trgm
  ON product_groups USING gin (brand gin_trgm_ops)
  WHERE brand IS NOT NULL AND brand <> '';
