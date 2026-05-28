import Link from "next/link";
import { stores } from "@/lib/stores";

type StoreItem = {
  id: string;
  name: string;
};

export function StoreMarquee({ storeList = stores }: { storeList?: StoreItem[] }) {
  const track = [...storeList, ...storeList];

  return (
    <div className="mt-12 border-t border-water-700/80 pt-10">
      <p className="mb-6 text-center text-sm font-medium text-water-500 sm:text-base">
        Oferty dostępne w {storeList.length} sprawdzonych sklepach wędkarskich
      </p>

      <div className="store-marquee relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20"
          aria-hidden
        />

        <div className="store-marquee-track flex w-max items-center gap-4 sm:gap-6">
          {track.map((store, index) => (
            <Link
              key={`${store.id}-${index}`}
              href="/sklepy"
              className="store-marquee-item shrink-0 rounded-xl border-2 border-water-600/80 bg-white px-5 py-3 text-sm font-semibold text-foreground shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-colors hover:border-accent-500 hover:text-accent-600 sm:px-6 sm:py-3.5 sm:text-base"
            >
              {store.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
