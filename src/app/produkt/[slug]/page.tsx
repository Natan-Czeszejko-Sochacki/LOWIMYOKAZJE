import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PriceTable } from "@/components/PriceTable";
import { ProductImage } from "@/components/ProductImage";
import { AddToCartButton } from "@/components/AddToCartButton";
import { getProductWithOffers } from "@/lib/product-cache";
import { pageMetadata, DEFAULT_DESCRIPTION } from "@/lib/site-metadata";
import { resolveCategory } from "@/lib/categories";
import { formatManufacturerDisplay } from "@/lib/product-matcher";
import {
  formatPrice,
  formatRelativeTime,
  getStoreNameForOffer,
  calcDiscountPercent,
  effectiveOriginalPrice,
} from "@/lib/price-engine";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await getProductWithOffers(slug);
  const title = p?.name ?? "Produkt";
  const description = p
    ? `${p.name} — porównaj ceny w polskich sklepach wędkarskich na ŁowimyOkazje.pl`
    : DEFAULT_DESCRIPTION;
  return pageMetadata({ title, description });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductWithOffers(slug);
  if (!product) notFound();
  if (product.slug !== slug) {
    redirect(`/produkt/${product.slug}`);
  }

  const category = resolveCategory(product.categoryId);
  const manufacturer = formatManufacturerDisplay(product.brand, product.name);
  const best = product.bestOffer;
  const bestEffectiveOriginal = best ? effectiveOriginalPrice(best) : undefined;
  const isPriceDrop =
    best?.previousPrice != null &&
    best.previousPrice > best.price &&
    !best.originalPrice;
  const bestLowest30d = best?.lowestPrice30d;
  const savings =
    best && product.offers.length > 1
      ? Math.max(...product.offers.map((o) => o.price)) - best.price
      : 0;
  const lastUpdated = product.offers.reduce(
    (latest, o) => (o.updatedAt > latest ? o.updatedAt : latest),
    ""
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-4 text-sm text-water-500 sm:mb-6">
        <Link href="/" className="hover:text-accent-500">
          Strona główna
        </Link>
        {category && (
          <>
            {" "}
            /{" "}
            <Link
              href={`/kategoria/${category.slug}`}
              className="hover:text-accent-500"
            >
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
        <div className="relative mx-auto aspect-square w-full max-w-md rounded-xl border border-water-700 bg-water-900 lg:max-h-[420px] lg:max-w-none">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="aspect-square h-full w-full rounded-xl object-contain lg:max-h-[420px]"
            priority
          />
          {product.discountPercent >= 20 && (
            <span className="absolute bottom-4 left-4 rounded-full bg-accent-500 px-4 py-1 text-sm font-bold text-white">
              Promocja −{product.discountPercent}%
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            {product.name}
          </h1>

          <dl className="mt-4 grid gap-2.5 border-y border-water-700 py-4 text-sm sm:mt-5 sm:py-5">
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[8.5rem_1fr] sm:items-baseline sm:gap-x-4">
              <dt className="text-water-500">Kategoria sprzętu</dt>
              <dd>
                {category ? (
                  <Link
                    href={`/kategoria/${category.slug}`}
                    className="font-medium text-accent-500 hover:text-accent-400 hover:underline"
                  >
                    {category.name}
                  </Link>
                ) : (
                  <span className="text-water-400">—</span>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[8.5rem_1fr] sm:items-baseline sm:gap-x-4">
              <dt className="text-water-500">EAN</dt>
              <dd className="font-mono text-foreground">{product.ean ?? "—"}</dd>
            </div>
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[8.5rem_1fr] sm:items-baseline sm:gap-x-4">
              <dt className="text-water-500">Producent</dt>
              <dd className="font-medium text-foreground">{manufacturer ?? "—"}</dd>
            </div>
          </dl>

          <p className="mt-4 text-water-400">{product.description}</p>

          {!best && product.offers.length > 0 && (
            <div className="mt-8 rounded-xl border border-water-700 bg-water-900 p-6">
              <p className="text-water-400">
                Obecnie brak dostępnych ofert w porównywanych sklepach.
              </p>
              <p className="mt-2 text-sm text-water-500">
                Poniżej znajdziesz ostatnio znane ceny — status dostępności może się
                różnić w sklepie.
              </p>
            </div>
          )}

          {best && (
            <div className="mt-6 rounded-xl border border-accent-500/30 bg-accent-950 p-4 sm:mt-8 sm:p-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-sm text-water-400">Najlepsza cena</p>
                {isPriceDrop && (
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                    ↓ CENA SPADŁA
                  </span>
                )}
                {product.discountPercent >= 5 && (
                  <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-bold text-white">
                    −{product.discountPercent}% PROMOCJA
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-foreground sm:text-4xl">
                {formatPrice(best.price)}
              </p>
              {bestEffectiveOriginal && (
                <p className="mt-1 text-water-500">
                  <span className="line-through">{formatPrice(bestEffectiveOriginal)}</span>
                  <span className="ml-2 font-semibold text-accent-500">
                    −{calcDiscountPercent(best.price, bestEffectiveOriginal)}% taniej
                  </span>
                </p>
              )}
              {bestLowest30d && (
                <p className="mt-1 text-xs text-water-500">
                  Najniższa cena z ostatnich 30 dni:{" "}
                  <span className="font-medium text-water-400">{formatPrice(bestLowest30d)}</span>
                </p>
              )}
              <p className="mt-2 text-water-400">
                w sklepie{" "}
                <strong className="text-accent-500">
                  {getStoreNameForOffer(best)}
                </strong>
              </p>
              {savings > 0 && (
                <p className="mt-1 text-sm text-emerald-600">
                  Oszczędzasz do {formatPrice(savings)} vs najdroższy sklep
                </p>
              )}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <a
                  href={best.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center rounded-xl bg-accent-500 px-5 py-3 text-center font-semibold text-white hover:bg-accent-400 sm:px-6"
                >
                  Kup teraz w{" "}
                  {getStoreNameForOffer(best)} →
                </a>
                <AddToCartButton
                  item={{
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.image,
                    storeId: best.storeId,
                    storeName: getStoreNameForOffer(best),
                    price: best.price,
                    url: best.url,
                  }}
                  className="inline-flex justify-center rounded-xl border border-accent-500/40 bg-white px-5 py-3 font-semibold text-accent-500 hover:bg-accent-50"
                />
                <button
                  type="button"
                  className="inline-flex justify-center rounded-xl border border-accent-500/40 bg-white px-5 py-3 font-semibold text-accent-500 hover:bg-accent-50"
                >
                  🔔 Ustaw alert cenowy
                </button>
              </div>
              {lastUpdated && (
                <p className="mt-3 text-xs text-water-500">
                  Ceny aktualizowane {formatRelativeTime(lastUpdated)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-foreground">
          Porównanie cen ({product.offers.length} sklepów)
        </h2>
        <PriceTable product={product} />
      </section>
    </div>
  );
}
