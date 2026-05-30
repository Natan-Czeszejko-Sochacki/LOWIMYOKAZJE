import { unstable_cache } from "next/cache";
import { getHomepageDealsUncached } from "./catalog-db";
import { getSyncStatsUncached } from "./db";

/** Dane strony głównej — cache 5 min (szybki powrót na /). */
export const getHomePageData = unstable_cache(
  async () => {
    const [stats, deals] = await Promise.all([
      getSyncStatsUncached(),
      getHomepageDealsUncached(),
    ]);
    return { deals, stats };
  },
  ["home-page-data-v1"],
  { revalidate: 300 }
);
