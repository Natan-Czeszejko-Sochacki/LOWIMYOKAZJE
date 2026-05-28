import type { Product, StoreOffer, ProductWithOffers } from "./types";
import { getStoreById } from "./stores";

export function calcDiscountPercent(
  price: number,
  originalPrice?: number
): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function findBestOffer(offers: StoreOffer[]): StoreOffer | null {
  const candidates = offers.filter((o) => o.price > 0 && o.inStock);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, o) => (o.price < best.price ? o : best));
}

/**
 * Zwraca "przekreśloną cenę" — TYLKO jeśli sklep sam ją podał na stronie.
 * previousPrice NIE jest tu używane — to nasza wewnętrzna historia, nie promocja.
 * lowestPrice30d jest też wyświetlane osobno (Omnibus), nie jako "stara cena".
 */
export function effectiveOriginalPrice(offer: StoreOffer): number | undefined {
  if (offer.originalPrice && offer.originalPrice > offer.price)
    return offer.originalPrice;
  return undefined;
}

export function enrichProduct(
  product: Product,
  offers: StoreOffer[]
): ProductWithOffers {
  const productOffers = offers.filter((o) => o.productId === product.id);
  const bestOffer = findBestOffer(productOffers);
  const maxOriginal = Math.max(
    ...productOffers.map((o) => effectiveOriginalPrice(o) ?? o.price),
    0
  );
  const discountPercent = bestOffer
    ? calcDiscountPercent(bestOffer.price, maxOriginal)
    : 0;

  return {
    ...product,
    offers: productOffers.sort((a, b) => a.price - b.price),
    bestOffer,
    discountPercent,
  };
}

export function getHotDeals(
  items: ProductWithOffers[],
  minDiscount = 25
): ProductWithOffers[] {
  return items
    .filter((p) => p.discountPercent >= minDiscount && p.bestOffer)
    .sort((a, b) => b.discountPercent - a.discountPercent);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "przed chwilą";
  if (mins < 60) return `${mins} min temu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} godz. temu`;
  return `${Math.floor(hours / 24)} dni temu`;
}

export function getStoreNameForOffer(offer: StoreOffer): string {
  return getStoreById(offer.storeId)?.name ?? offer.storeId;
}
