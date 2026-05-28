import type { Product } from "./types";

/** Zweryfikowane szablony wyszukiwania (HTTP 200) — zapas gdy brak oferty w Ceneo */
export const storeSearchTemplates: Record<
  string,
  (query: string) => string
> = {
  "fishing-mart": (q) =>
    `https://www.fishing-mart.com.pl/szukaj?search=${encodeURIComponent(q)}`,
  "wedkarski-com": (q) =>
    `https://wedkarski.com/szukaj?szukaj=${encodeURIComponent(q)}`,
  "major-fishing": (q) =>
    `https://major-fishing.pl/?s=${encodeURIComponent(q)}`,
  "max-fish": (q) => `https://max-fish.pl/?s=${encodeURIComponent(q)}`,
  "centrum-wedkarskie": (q) =>
    `https://centrumwedkarskie.pl/?s=${encodeURIComponent(q)}`,
  fishingstore: (q) =>
    `https://www.fishingstore.pl/?s=${encodeURIComponent(q)}`,
  allans: (q) => `https://www.allans.pl/?s=${encodeURIComponent(q)}`,
  kolowrotek: (q) =>
    `https://kolowrotek.pl/szukaj?fraza=${encodeURIComponent(q)}`,
  wedkomania: (q) => `https://wedkomania.pl/?s=${encodeURIComponent(q)}`,
  "spinning-pl": (q) => `https://spinning.pl/?s=${encodeURIComponent(q)}`,
  insel: (q) => `https://insel.pl/?s=${encodeURIComponent(q)}`,
  "sklep-mietus": (q) =>
    `https://www.sklep-mietus.pl/pl/szukaj?search=${encodeURIComponent(q)}`,
  "hunter-fish": (q) =>
    `https://www.hunter-fish.pl/?s=${encodeURIComponent(q)}`,
  sportex: (q) => `https://sportex.pl/?s=${encodeURIComponent(q)}`,
  profisher: (q) => `https://profisher.pl/?s=${encodeURIComponent(q)}`,
  nizel: (q) =>
    `https://nizel.pl/pl/search?search=${encodeURIComponent(q)}`,
};

/** Domeny sklepów mapowane na ID (dopasowanie z data-shopurl Ceneo) */
export const domainToStoreId: Record<string, string> = {
  "fishing-mart.com.pl": "fishing-mart",
  "www.fishing-mart.com.pl": "fishing-mart",
  "wedkarski.com": "wedkarski-com",
  "www.wedkarski.com": "wedkarski-com",
  "major-fishing.pl": "major-fishing",
  "www.major-fishing.pl": "major-fishing",
  "max-fish.pl": "max-fish",
  "www.max-fish.pl": "max-fish",
  "centrumwedkarskie.pl": "centrum-wedkarskie",
  "www.centrumwedkarskie.pl": "centrum-wedkarskie",
  "fishingstore.pl": "fishingstore",
  "www.fishingstore.pl": "fishingstore",
  "allans.pl": "allans",
  "www.allans.pl": "allans",
  "kolowrotek.pl": "kolowrotek",
  "www.kolowrotek.pl": "kolowrotek",
  "wedkomania.pl": "wedkomania",
  "www.wedkomania.pl": "wedkomania",
  "spinning.pl": "spinning-pl",
  "www.spinning.pl": "spinning-pl",
  "insel.pl": "insel",
  "www.insel.pl": "insel",
  "sklep-mietus.pl": "sklep-mietus",
  "www.sklep-mietus.pl": "sklep-mietus",
  "hunter-fish.pl": "hunter-fish",
  "www.hunter-fish.pl": "hunter-fish",
  "sportex.pl": "sportex",
  "www.sportex.pl": "sportex",
  "profisher.pl": "profisher",
  "www.profisher.pl": "profisher",
  "nizel.pl": "nizel",
  "www.nizel.pl": "nizel",
};

export function getSearchQuery(product: Product): string {
  return product.searchQuery ?? product.name;
}

export function buildStoreSearchUrl(storeId: string, product: Product): string {
  const q = getSearchQuery(product);
  const builder = storeSearchTemplates[storeId];
  if (builder) return builder(q);
  return `https://www.google.com/search?q=${encodeURIComponent(`${q} site:${storeId}`)}`;
}

export function matchStoreIdFromDomain(shopDomain: string): string | null {
  const normalized = shopDomain.replace(/^www\./, "").toLowerCase();
  return domainToStoreId[normalized] ?? domainToStoreId[shopDomain] ?? null;
}
