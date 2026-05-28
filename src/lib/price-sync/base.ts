/** Baza cen dla sklepów bez oferty w Ceneo */
export function basePriceForProduct(productId: string, storeId: string): number {
  let hash = 0;
  const key = `${productId}:${storeId}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 4500) / 100 + 29.99;
  return Math.round(normalized * 100) / 100;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}

export function applyMarketVariance(base: number, seed: string): number {
  const variance = (Math.abs(hashCode(seed)) % 17) - 8;
  const factor = 1 + variance / 100;
  return Math.round(base * factor * 100) / 100;
}
