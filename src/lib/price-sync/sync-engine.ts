import { runCatalogSync } from "../catalog-sync";

/** Pełna synchronizacja katalogu i cen co 5 godzin */
export async function runFullSync() {
  return runCatalogSync();
}

/** Szybsza aktualizacja samych cen (istniejące URL-e) */
export async function runPriceRefresh() {
  return runCatalogSync({ priceOnly: true });
}
