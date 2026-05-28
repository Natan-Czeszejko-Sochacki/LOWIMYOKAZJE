import fs from "node:fs";

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

function isSyncPausedOnDisk(): boolean {
  if (process.env.SYNC_DISABLED === "1" || process.env.DISABLE_PRICE_CRON === "1") {
    return true;
  }

  return fs.existsSync(".sync-paused");
}

export async function registerNode() {
  if (isSyncPausedOnDisk()) {
    console.info("[sync] Wstrzymany - plik .sync-paused lub SYNC_DISABLED=1");
    return;
  }

  const runSync = async () => {
    if (isSyncPausedOnDisk()) {
      console.info("[sync] Pominieto - synchronizacja wstrzymana");
      return;
    }
    try {
      const { syncAllStorePrices } = await import("../lib/price-sync");
      const result = await syncAllStorePrices();
      console.info(
        "[cron] Sync cen zakonczony:",
        result.updated,
        "ofert,",
        result.ceneoMatches,
        "dopasowan Ceneo"
      );
    } catch (err) {
      console.error("[cron] Blad synchronizacji cen:", err);
    }
  };

  const scheduleNext = () => {
    setTimeout(async () => {
      await runSync();
      scheduleNext();
    }, FIVE_HOURS_MS);
  };

  setTimeout(runSync, 15_000);
  scheduleNext();
}
