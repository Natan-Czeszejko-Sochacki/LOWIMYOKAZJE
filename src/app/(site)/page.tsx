import { HomeHero } from "@/components/HomeHero";
import { HotDealsCarousel } from "@/components/HotDealsCarousel";
import { StoreMarquee } from "@/components/StoreMarquee";
import { HOT_DEALS_SECTION_ID } from "@/lib/home-sections";
import { stores } from "@/lib/stores";
import { getHomepageDeals } from "@/lib/catalog";
import { getSyncStats } from "@/lib/db";

export const revalidate = 300;

export default async function HomePage() {
  const [deals, stats] = await Promise.all([
    getHomepageDeals(),
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
          <StoreMarquee />
        </div>
      </section>

      <div className="mx-auto max-w-7xl bg-white px-4 py-10 sm:px-6">
        <p className="text-sm text-water-500">
          {stores.length} sklepów · {stats.listings.toLocaleString("pl-PL")} produktów w bazie
        </p>
      </div>
    </div>
  );
}
