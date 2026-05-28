import type { ProductWithOffers } from "@/lib/types";
import { stores } from "@/lib/stores";
import {
  formatPrice,
  formatRelativeTime,
  calcDiscountPercent,
  effectiveOriginalPrice,
} from "@/lib/price-engine";
import { offerLinkLabel } from "@/lib/offer-url";

export function PriceTable({ product }: { product: ProductWithOffers }) {
  const sorted = [...product.offers].sort((a, b) => a.price - b.price);
  const bestPrice = sorted[0]?.price;

  return (
    <div className="overflow-hidden rounded-xl border border-water-700 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-water-700 bg-water-900">
            <th className="px-4 py-3 font-semibold text-water-300">Sklep</th>
            <th className="px-4 py-3 font-semibold text-water-300">Cena</th>
            <th className="hidden px-4 py-3 font-semibold text-water-300 sm:table-cell">
              Naj. cena 30 dni
            </th>
            <th className="hidden px-4 py-3 font-semibold text-water-300 sm:table-cell">
              Promocja
            </th>
            <th className="px-4 py-3 font-semibold text-water-300">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((offer) => {
            const store = stores.find((s) => s.id === offer.storeId);
            const isBest = offer.price === bestPrice && offer.inStock;
            const effOriginal = effectiveOriginalPrice(offer);
            const discount = calcDiscountPercent(offer.price, effOriginal);
            const isPriceDrop =
              offer.previousPrice != null &&
              offer.previousPrice > offer.price &&
              !offer.originalPrice;

            return (
              <tr
                key={`${offer.storeId}-${offer.productId}`}
                className={`border-b border-water-700 ${
                  isBest ? "bg-accent-950" : "bg-white"
                }`}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {store?.name ?? offer.storeId}
                  </span>
                  {isBest && (
                    <span className="ml-2 rounded-full bg-accent-500 px-2 py-0.5 text-xs font-bold text-white">
                      NAJLEPSZA
                    </span>
                  )}
                  {isPriceDrop && (
                    <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                      ↓ CENA SPADŁA
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(offer.price)}
                  </span>
                  {effOriginal && (
                    <span className="ml-2 text-water-500 line-through">
                      {formatPrice(effOriginal)}
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {offer.lowestPrice30d ? (
                    <span className="text-sm text-water-400">{formatPrice(offer.lowestPrice30d)}</span>
                  ) : (
                    <span className="text-water-500">—</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {discount > 0 ? (
                    <span className="font-semibold text-accent-500">−{discount}%</span>
                  ) : (
                    <span className="text-water-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {offer.inStock ? (
                    <span className="text-emerald-600">Dostępny</span>
                  ) : (
                    <span className="text-water-500">Brak</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-water-800 px-3 py-1.5 text-xs font-medium text-water-300 hover:bg-accent-500 hover:text-white"
                  >
                    {offerLinkLabel(offer.url)}
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {sorted[0] && (
        <p className="border-t border-water-700 bg-water-900 px-4 py-2 text-xs text-water-500">
          Ostatnia aktualizacja: {formatRelativeTime(sorted[0].updatedAt)} ·{" "}
          {sorted.length} sklepów
        </p>
      )}
    </div>
  );
}
