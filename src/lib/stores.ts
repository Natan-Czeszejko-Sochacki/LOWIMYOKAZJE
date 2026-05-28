import type { Store } from "./types";
import { STORE_CONFIGS } from "./store-configs";

/** Wyłącznie 20 sklepów z listy użytkownika */
export const stores: Store[] = STORE_CONFIGS.map((c) => ({
  id: c.id,
  name: c.name,
  url: c.baseUrl,
  description: `Sklep wędkarski ${c.name} — produkty z bezpośrednimi linkami.`,
  trustScore: 90,
}));

export function getStoreById(id: string): Store | undefined {
  return stores.find((s) => s.id === id);
}
