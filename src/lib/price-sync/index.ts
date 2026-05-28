import { getSyncStats } from "../db";
import { isSyncAborted } from "../sync-control";
import { isSyncPaused } from "../sync-control-node";
import { runFullSync } from "./sync-engine";

const SYNC_LOCK = Symbol.for("lowimyokazje.catalogSyncInProgress");

type SyncGlobal = typeof globalThis & {
  [SYNC_LOCK]?: boolean;
};

export async function syncAllStorePrices() {
  if (isSyncPaused() || isSyncAborted()) {
    const stats = getSyncStats();
    return {
      updated: stats.listings,
      syncedAt: stats.lastSync ?? new Date().toISOString(),
      stores: 20,
      listingsTotal: stats.listings,
      groups: stats.groups,
      skipped: true,
      aborted: true,
    };
  }

  const syncGlobal = globalThis as SyncGlobal;
  if (syncGlobal[SYNC_LOCK]) {
    const stats = getSyncStats();
    return {
      updated: stats.listings,
      syncedAt: stats.lastSync ?? new Date().toISOString(),
      stores: 20,
      listingsTotal: stats.listings,
      groups: stats.groups,
      skipped: true,
    };
  }

  syncGlobal[SYNC_LOCK] = true;
  try {
    const result = await runFullSync();

    const after = getSyncStats();
    return {
      updated: result.listingsProcessed,
      syncedAt: result.syncedAt,
      stores: result.stores,
      listingsTotal: after.listings,
      groups: after.groups,
      imagesUpdated: 0,
      ceneoMatches: 0,
    };
  } finally {
    syncGlobal[SYNC_LOCK] = false;
  }
}

export async function getOffers() {
  const { getListingsForCatalog } = await import("../catalog-db");
  return getListingsForCatalog();
}
