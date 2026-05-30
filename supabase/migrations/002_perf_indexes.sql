-- Opcjonalnie w SQL Editor (strona główna + kategorie)
CREATE INDEX IF NOT EXISTS idx_listings_store_promo
  ON listings (store_id, group_id, price)
  WHERE price > 0 AND original_price IS NOT NULL AND original_price > price;

CREATE INDEX IF NOT EXISTS idx_listings_group_store_price
  ON listings (group_id, store_id, price)
  WHERE price > 0;
