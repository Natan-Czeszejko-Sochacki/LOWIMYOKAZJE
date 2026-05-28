import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { HomeHero } from "@/components/HomeHero";
import { HotDealsCarousel } from "@/components/HotDealsCarousel";
import { HOT_DEALS_SECTION_ID } from "@/lib/home-sections";
import { stores } from "@/lib/stores";
import { getHomepageDeals, getFeaturedProducts } from "@/lib/catalog";
import { getSyncStats } from "@/lib/db";

export const revalidate = 300;

export default async function HomePage() {
  const [deals, featured, stats] = await Promise.all([
    getHomepageDeals(),
    getFeaturedProducts(6),
    Promise.resolve(getSyncStats()),
  ]);

  return (
    <div>
      <HomeHero />

      <section
        id={HOT_DEALS_SECTION_ID}
        className="scroll-mt-36 border-b border-water-700 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <HotDealsCarousel deals={deals} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 bg-white px-4 py-10 sm:px-6">
        <p className="text-sm text-water-500">
          {stores.length} sklepów · {stats.listings.toLocaleString("pl-PL")} produktów w bazie
        </p>

        <section>
          <h2 className="mb-6 text-2xl font-bold text-foreground">Popularne produkty</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-water-700 bg-water-900 p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">
            Porównujemy {stores.length} sprawdzonych sklepów
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-water-400">
            Fishing-Mart, Wędkarski.com, Allan&apos;s, Sportex i inne firmy z
            wieloletnią tradycją — tylko realni sprzedawcy, do których można zajść
            lub zadzwonić.
          </p>
          <Link
            href="/sklepy"
            className="mt-4 inline-block font-medium text-accent-500 hover:text-accent-400 hover:underline"
          >
            Lista sklepów →
          </Link>
        </section>
      </div>
    </div>
  );
}
