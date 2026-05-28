import Link from "next/link";
import type { ProductWithOffers } from "@/lib/types";
import {
  formatPrice,
  formatRelativeTime,
  getStoreNameForOffer,
} from "@/lib/price-engine";
import { formatManufacturerDisplay } from "@/lib/product-matcher";
import { ProductImage } from "./ProductImage";

type Props = {
  product: ProductWithOffers;
  variant?: "default" | "deal";
};

export function ProductCard({ product, variant = "default" }: Props) {
  const best = product.bestOffer;
  const isDeal = variant === "deal" && product.discountPercent >= 20;
  const manufacturer = formatManufacturerDisplay(product.brand, product.name);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl border border-water-700 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-md"
    >
      {isDeal && (
        <div className="bg-accent-950 px-3 py-1.5 text-center text-xs font-bold text-accent-500">
          −{product.discountPercent}% taniej
        </div>
      )}

      <Link href={`/produkt/${product.slug}`} className="flex flex-1 flex-col p-4">
        <div className="relative mb-3 h-36 w-full rounded-lg bg-water-900">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-36 w-full rounded-lg"
          />
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-accent-500">
          {manufacturer}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-accent-500">
          {product.name}
        </h3>

        {best ? (
          <div className="mt-auto pt-4">
            <p className="text-2xl font-bold text-foreground">{formatPrice(best.price)}</p>
            {best.originalPrice && best.originalPrice > best.price && (
              <p className="text-sm text-water-500 line-through">
                {formatPrice(best.originalPrice)}
              </p>
            )}
            <p className="mt-1 text-xs text-water-400">
              Najtaniej:{" "}
              <span className="font-medium text-accent-500">
                {getStoreNameForOffer(best)}
              </span>
            </p>
            <p className="text-xs text-water-500">
              {product.offers.length} sklepów · {formatRelativeTime(best.updatedAt)}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-water-500">Brak ofert w magazynie</p>
        )}
      </Link>
    </article>
  );
}
