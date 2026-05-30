import { STORE_CONFIGS } from "./store-configs";
import { collectStoreProducts } from "./scrapers/collect-urls";
import { fetchAndParseProduct } from "./scrapers/parse-product-page";
import { delay } from "./scrapers/sitemap-utils";
import {
  ProductIdentityIndex,
  externalIdFromUrl,
} from "./product-matcher";
import {
  batchUpsertListings,
  deleteListings,
  mergeDuplicateProductGroups,
  rebuildFts,
  cleanWidgetPrices,
  purgeEmptyListings,
  getSyncStats,
  getRecentlyUpdatedUrls,
} from "./db";
import { queryRows } from "./sql";
import { inferCategorySlug } from "./categories";
import { shouldAbortSync } from "./sync-control-node";

/** Ile równocześnie pobieranych stron produktowych na sklep */
const PRICE_CONCURRENCY = 30;
/** Ile sklepów przetwarzanych równolegle */
const STORE_PARALLELISM = 4;
/** Piszemy do DB w porcjach — mniej fsync, szybszy zapis */
const WRITE_BATCH_SIZE = 40;
/** Przerwa między sklepami (ms) — nieużywana przy parallel, ale zostawiona dla rate-limit */
const BETWEEN_STORE_DELAY = 200;
/** Pomiń produkty zaktualizowane krócej niż N godzin temu */
const SKIP_IF_FRESHER_THAN_HOURS = 6;

export async function runCatalogSync(options?: {
  priceOnly?: boolean;
  storeIds?: string[];
}): Promise<{
  syncedAt: string;
  stores: number;
  listingsProcessed: number;
  listingsTotal: number;
}> {
  const configs = STORE_CONFIGS.filter(
    (c) => !options?.storeIds?.length || options.storeIds.includes(c.id)
  ).sort((a, b) => syncPriority(a.type) - syncPriority(b.type));

  let listingsProcessed = 0;

  // Przetwarzaj sklepy w równoległych partiach (STORE_PARALLELISM na raz)
  for (let i = 0; i < configs.length; i += STORE_PARALLELISM) {
    if (shouldAbortSync()) {
      console.info("[sync] Przerwano — synchronizacja wstrzymana");
      break;
    }

    const batch = configs.slice(i, i + STORE_PARALLELISM);

    await Promise.allSettled(
      batch.map(async (config) => {
        console.info(`[sync] Sklep: ${config.name}…`);

        let items: { url: string; name?: string; imageUrl?: string }[] = [];

        if (options?.priceOnly) {
          const rows = await queryRows<{
            url: string;
            name: string;
            image_url: string | null;
          }>(
            "SELECT url, name, image_url FROM listings WHERE store_id = ?",
            [config.id]
          );
          items = rows.map((r) => ({
            url: r.url,
            name: r.name,
            imageUrl: r.image_url ?? undefined,
          }));
        } else {
          try {
            items = await collectStoreProducts(config);
            console.info(`[sync] ${config.name}: ${items.length} URL-i produktów`);
          } catch (err) {
            console.error(`[sync] Błąd zbierania ${config.name}:`, err);
            return;
          }
        }

        const processed = await processItemsBatch(config.id, items, options?.priceOnly);
        listingsProcessed += processed;
        console.info(`[sync] ${config.name}: zapisano/odświeżono ${processed} ofert`);
        await delay(BETWEEN_STORE_DELAY);
      })
    );
  }

  try {
    const purged = await purgeEmptyListings();
    if (purged.listingsRemoved > 0 || purged.groupsRemoved > 0) {
      console.info(
        `[sync] Usunięto puste rekordy: ${purged.listingsRemoved} ofert, ${purged.groupsRemoved} grup`
      );
    }
  } catch {
    /* non-critical */
  }

  // Automatyczne czyszczenie błędnych "cen przed promocją" (widgety sklepów)
  try {
    const cleaned = await cleanWidgetPrices();
    if (cleaned > 0) {
      console.info(`[sync] Wyczyszczono ${cleaned} błędnych original_price (widgety)`);
    }
  } catch {
    /* non-critical */
  }

  if (!options?.priceOnly) {
    try {
      await rebuildFts();
    } catch {
      /* fts optional */
    }
  }

  try {
    const merged = await mergeDuplicateProductGroups();
    if (merged.listingsUpdated > 0 || merged.groupsRemoved > 0) {
      console.info(
        `[sync] Scalono duplikaty: ${merged.listingsUpdated} ofert, usunięto ${merged.groupsRemoved} pustych grup`
      );
    }
  } catch (err) {
    console.error("[sync] Błąd scalania duplikatów:", err);
  }

  const stats = await getSyncStats();
  return {
    syncedAt: new Date().toISOString(),
    stores: configs.length,
    listingsProcessed,
    listingsTotal: stats.listings,
  };
}

function syncPriority(type: (typeof STORE_CONFIGS)[number]["type"]): number {
  if (type.includes("sitemap")) return 0;
  if (type === "prestashop-crawl") return 1;
  return 2;
}

async function processItemsBatch(
  storeId: string,
  items: { url: string; name?: string; imageUrl?: string }[],
  priceOnly = false
): Promise<number> {
  if (items.length === 0) return 0;

  // Zbuduj cache świeżo zaktualizowanych URL-i — pomijamy refetch jeśli < 6h
  const freshUrls = priceOnly
    ? new Set<string>()
    : await getRecentlyUpdatedUrls(storeId, SKIP_IF_FRESHER_THAN_HOURS);

  const skipped = items.filter((it) => freshUrls.has(it.url.split("?")[0])).length;
  const toFetch = items.filter((it) => !freshUrls.has(it.url.split("?")[0]));

  if (skipped > 0) {
    console.info(`[sync] ${storeId}: ${skipped} świeżych — pomijam, fetchuję ${toFetch.length}`);
  }

  let idx = 0;
  let processed = 0;
  let rejected = 0;
  const writeBuf: Parameters<typeof batchUpsertListings>[0] = [];
  const deleteIds: string[] = [];
  const identityIndex = ProductIdentityIndex.fromListings(
    await queryRows<{
      group_id: string;
      name: string;
      brand: string | null;
      ean: string | null;
      producer_code: string | null;
    }>("SELECT group_id, name, brand, ean, producer_code FROM listings")
  );

  async function flushBuf() {
    if (writeBuf.length === 0) return;
    const batch = writeBuf.splice(0);
    await batchUpsertListings(batch);
  }

  async function worker() {
    while (idx < toFetch.length) {
      if (shouldAbortSync()) return;

      const i = idx++;
      const item = toFetch[i];
      const url = item.url.split("?")[0];

      const parsed = await fetchAndParseProduct(url);
      const listingId = `${storeId}:${externalIdFromUrl(url)}`;
      const name = parsed?.name?.trim() || item.name?.trim() || "";
      const price = parsed?.price ?? null;

      if (!parsed || !name || price == null || price <= 0) {
        deleteIds.push(listingId);
        rejected++;
        continue;
      }

      const imageUrl = parsed.imageUrl || item.imageUrl || null;
      const brand = parsed.brand ?? null;
      const ean = parsed.ean ?? null;
      const producerCode = parsed.producerCode ?? null;
      const groupId = identityIndex.resolve({
        name,
        brand,
        ean,
        producerCode,
      });

      writeBuf.push({
        id: listingId,
        groupId,
        storeId,
        name,
        url,
        price,
        originalPrice: parsed.originalPrice,
        lowestPrice30d: parsed.lowestPrice30d,
        imageUrl,
        ean,
        producerCode,
        brand,
        inStock: parsed.inStock ?? true,
        categoryId: inferCategorySlug(name),
      });

      processed++;

      // Zapis do DB w partiach
      if (writeBuf.length >= WRITE_BATCH_SIZE) await flushBuf();

      if ((i + 1) % 100 === 0) {
        console.info(`[sync] ${storeId}: ${i + 1}/${toFetch.length}`);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(PRICE_CONCURRENCY, toFetch.length || 1) },
    () => worker()
  );
  await Promise.all(workers);

  // Zapis pozostałych
  await flushBuf();

  if (deleteIds.length > 0) {
    await deleteListings(deleteIds);
  }
  if (rejected > 0) {
    console.info(`[sync] ${storeId}: pominięto ${rejected} ofert bez ceny / błędnego fetcha`);
  }

  return processed + skipped;
}
