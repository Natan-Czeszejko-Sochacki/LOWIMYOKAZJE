-- Opcjonalnie w SQL Editor (przyspiesza okazje na stronie głównej)
CREATE INDEX IF NOT EXISTS idx_listings_store_promo
  ON listings (store_id, group_id, price)
  WHERE price > 0 AND original_price IS NOT NULL AND original_price > price;
