export type StoreScrapeType =
  | "iai-sitemap"
  | "wc-sitemap"
  | "fatfish-sitemap"
  | "feederland-sitemap"
  | "rockworld-sitemap"
  | "carpride-sitemap"
  | "prestashop-crawl"
  | "category-crawl"
  | "sitemap-flat";

export type StoreConfig = {
  id: string;
  name: string;
  baseUrl: string;
  type: StoreScrapeType;
  /** Indeks sitemapu lub główny sitemap */
  sitemapUrl?: string;
  /** Filtr URL produktu */
  productUrlTest: RegExp;
  /** Wykluczenia */
  excludeUrl?: RegExp;
  /** Dodatkowe strony startowe dla crawlera HTML */
  startUrls?: string[];
  /** Opcjonalny bezpiecznik odwiedzonych stron przy crawlerze HTML */
  maxPages?: number;
};

export const STORE_CONFIGS: StoreConfig[] = [
  {
    id: "angryfish",
    name: "AngryFish",
    baseUrl: "https://angryfish.pl",
    type: "category-crawl",
    productUrlTest: /angryfish\.pl\/pl\/p\//i,
    excludeUrl: /(\/pl\/panel\/|\/basket|\/login|\/search|\/contact)/i,
    startUrls: ["https://angryfish.pl/pl/new"],
  },
  {
    id: "big-fish",
    name: "Big Fish",
    baseUrl: "https://big-fish.pl",
    type: "category-crawl",
    productUrlTest: /big-fish\.pl\/(?!.*(?:koszyk|kontakt|producenci|producent|nowe-produkty|promocje|blog|content|module|szukaj|logowanie))[^?#]+$/i,
    excludeUrl: /\/(?:koszyk|kontakt|producenci|producent|nowe-produkty|promocje|blog|content|module|szukaj|logowanie)(?:[/?#]|$)/i,
    startUrls: ["https://big-fish.pl/nowe-produkty"],
  },
  {
    id: "carpride",
    name: "CarpRide",
    baseUrl: "https://carpride.pl",
    type: "carpride-sitemap",
    sitemapUrl: "https://carpride.pl/product-sitemap.xml",
    productUrlTest: /carpride\.pl\/p\//i,
  },
  {
    id: "centrum-wedkarskie",
    name: "Centrum Wędkarskie",
    baseUrl: "https://centrumwedkarskie.pl",
    type: "wc-sitemap",
    sitemapUrl: "https://centrumwedkarskie.pl/product-sitemap.xml",
    productUrlTest: /centrumwedkarskie\.pl\/produkt\//i,
    excludeUrl: /\/sklep\/?$/i,
  },
  {
    id: "e-amur",
    name: "E-Amur",
    baseUrl: "https://e-amur.pl",
    type: "wc-sitemap",
    sitemapUrl: "https://e-amur.pl/product-sitemap.xml",
    productUrlTest: /e-amur\.pl\/produkt\//i,
  },
  // Ehooks tymczasowo wyłączone (ponad 25k produktów – zbyt wolne do wstępnego crawlu)
  // { id: "ehooks", name: "Ehooks", baseUrl: "https://ehooks.pl", type: "sitemap-flat",
  //   sitemapUrl: "https://ehooks.pl/sitemap.xml.gz", productUrlTest: /ehooks\.pl\/pl\/products\//i },
  {
    id: "fatfish",
    name: "FatFish",
    baseUrl: "https://fatfish.pl",
    type: "fatfish-sitemap",
    sitemapUrl: "https://fatfish.pl/sitemap.xml",
    productUrlTest: /fatfish\.pl\/[^,]+,id\d+\.html$/i,
  },
  {
    id: "feederland",
    name: "Feederland",
    baseUrl: "https://feederland.pl",
    type: "feederland-sitemap",
    sitemapUrl: "https://feederland.pl/sitemap.xml",
    productUrlTest: /feederland\.pl\/.*\/product\//i,
  },
  {
    id: "haczykowo",
    name: "Haczykowo",
    baseUrl: "https://haczykowo.pl",
    type: "category-crawl",
    productUrlTest: /haczykowo\.pl\/.*\.html$/i,
    excludeUrl: /(kontakt|blog|o-nas|regulamin|koszyk)/i,
  },
  {
    id: "karpiowa-chata",
    name: "Karpiowa Chata",
    baseUrl: "https://karpiowachata.pl",
    type: "wc-sitemap",
    sitemapUrl: "https://karpiowachata.pl/product-sitemap.xml",
    productUrlTest: /karpiowachata\.pl\/produkt\//i,
  },
  {
    id: "karpiowy",
    name: "Karpiowy",
    baseUrl: "https://www.karpiowy.pl",
    type: "category-crawl",
    productUrlTest: /karpiowy\.pl\/.*\.html$/i,
    excludeUrl: /(contact|kontakt|blog|regulamin|koszyk|account|login|cart|route=)/i,
  },
  {
    id: "matchsklep",
    name: "MatchSklep",
    baseUrl: "https://matchsklep.pl",
    type: "category-crawl",
    productUrlTest: /matchsklep\.pl\/produkt\//i,
  },
  {
    id: "moonfin",
    name: "Moonfin",
    baseUrl: "https://moonfin.pl",
    type: "iai-sitemap",
    sitemapUrl: "https://moonfin.pl/1_index_sitemap.xml",
    productUrlTest: /moonfin\.pl\/.*\.html$/i,
    excludeUrl: /(kontakt|blog|o-nas|regulamin)/i,
  },
  {
    id: "rm-rybka",
    name: "RM Rybka",
    baseUrl: "https://rmrybka.pl",
    type: "category-crawl",
    productUrlTest: /rmrybka\.pl\/(produkt|product|p)\//i,
  },
  {
    id: "roach-shop",
    name: "Roach Shop",
    baseUrl: "https://roach-shop.pl",
    type: "prestashop-crawl",
    productUrlTest: /roach-shop\.pl\/pl\/\d+-/i,
    excludeUrl: /(\/pl\/(?:koszyk|kontakt|logowanie|zamowienie|content|producenci|dostawcy)(?:[/?#]|$)|controller=)/i,
  },
  {
    id: "rockworld",
    name: "Rockworld",
    baseUrl: "https://www.rockworld.pl",
    type: "rockworld-sitemap",
    sitemapUrl: "https://www.rockworld.pl/static/sitemap-all.xml",
    productUrlTest: /rockworld\.pl\/p,/i,
    excludeUrl: /\/k,\d+,/i,
  },
  {
    id: "sklep-drapieznik",
    name: "Sklep Drapieżnik",
    baseUrl: "https://sklepdrapieznik.pl",
    type: "sitemap-flat",
    sitemapUrl: "https://sklepdrapieznik.pl/sitemap-pl-1-with-images-only-product-index.xml",
    productUrlTest: /sklepdrapieznik\.pl\/\d+-/i,
    excludeUrl: /\/(?:brand|category)\//i,
  },
  {
    id: "sklep-mietus",
    name: "Sklep Miętus",
    baseUrl: "https://www.sklep-mietus.pl",
    type: "iai-sitemap",
    sitemapUrl: "https://sklep-mietus.pl/1_index_sitemap.xml",
    productUrlTest: /sklep-mietus\.pl\/pl\/.*\/\d+-/i,
  },
  {
    id: "sklep-rybka",
    name: "Sklep Rybka",
    baseUrl: "https://skleprybka.pl",
    type: "category-crawl",
    productUrlTest: /skleprybka\.pl\/(produkt|product)\//i,
  },
  {
    id: "wedkarski",
    name: "Wedkarski",
    baseUrl: "https://wedkarski.com",
    type: "iai-sitemap",
    sitemapUrl: "https://wedkarski.com/1_index_sitemap.xml",
    productUrlTest: /wedkarski\.com\/\d+.*\.html$/i,
  },
];

export const ALLOWED_STORE_IDS = new Set(STORE_CONFIGS.map((s) => s.id));
