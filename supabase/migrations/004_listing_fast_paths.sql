-- Szybsze EXISTS / JOIN po group_id (kategorie + pobranie ofert strony)
CREATE INDEX IF NOT EXISTS idx_listings_group_store_price_active
  ON listings (group_id, store_id, price)
  WHERE price > 0;

CREATE INDEX IF NOT EXISTS idx_listings_ean_trgm
  ON listings USING gin (ean gin_trgm_ops)
  WHERE ean IS NOT NULL AND ean <> '';

CREATE INDEX IF NOT EXISTS idx_listings_producer_code_trgm
  ON listings USING gin (producer_code gin_trgm_ops)
  WHERE producer_code IS NOT NULL AND producer_code <> '';
