import type { StoreConfig } from "../store-configs";
import {
  fetchXml,
  parseSitemapLocs,
  parseIAIProductSitemap,
  collectSitemapUrls,
  delay,
} from "./sitemap-utils";
import { crawlCategoryStore, crawlPrestaShop } from "./crawl-category";

export type CollectedItem = {
  url: string;
  name?: string;
  imageUrl?: string;
};

function filterUrls(config: StoreConfig, urls: string[]): string[] {
  return urls.filter((u) => {
    if (!config.productUrlTest.test(u)) return false;
    if (config.excludeUrl?.test(u)) return false;
    return true;
  });
}

export async function collectStoreProducts(
  config: StoreConfig
): Promise<CollectedItem[]> {
  switch (config.type) {
    case "iai-sitemap": {
      if (!config.sitemapUrl) return [];
      const items: CollectedItem[] = [];
      const pending = [config.sitemapUrl];
      const seen = new Set<string>();

      while (pending.length > 0) {
        const mapUrl = pending.shift()!;
        if (seen.has(mapUrl)) continue;
        seen.add(mapUrl);
        await delay(300);

        try {
          const xml = await fetchXml(mapUrl);
          if (xml.includes("<image:image>")) {
            for (const e of parseIAIProductSitemap(xml)) {
              if (isAllowedProductUrl(config, e.url)) items.push(e);
            }
          } else {
            const locs = parseSitemapLocs(xml);
            for (const child of locs.filter((u) => /sitemap|\.xml(?:\.gz)?$/i.test(u))) {
              pending.push(child);
            }
            for (const u of filterUrls(config, locs)) {
              items.push({ url: u });
            }
          }
        } catch {
          /* skip map */
        }
      }
      return dedupeItems(items);
    }

    case "wc-sitemap":
    case "carpride-sitemap": {
      // WooCommerce paginuje sitemapę po 1000 URL-i na plik.
      // Zaczynamy od sitemap_index.xml który listuje wszystkie strony.
      const urls = await collectWcSitemapUrls(config);
      return urls.map((url) => ({ url }));
    }

    case "sitemap-flat": {
      if (!config.sitemapUrl) return [];
      const urls = await collectSitemapUrls(config.sitemapUrl, (url) =>
        isAllowedProductUrl(config, url)
      );
      return urls.map((url) => ({ url }));
    }

    case "fatfish-sitemap": {
      if (!config.sitemapUrl) return [];
      const xml = await fetchXml(config.sitemapUrl);
      const cats = parseSitemapLocs(xml).filter(
        (u) => u.includes(",c") && u.endsWith(".html")
      );
      const items: CollectedItem[] = [];
      for (const cat of cats) {
        await delay(100);
        try {
          const urls = await crawlCategoryStore(
            cat,
            config.productUrlTest,
            config.excludeUrl
          );
          items.push(...urls.map((url) => ({ url })));
        } catch {
          /* */
        }
      }
      return dedupeItems(items);
    }

    case "feederland-sitemap": {
      if (!config.sitemapUrl) return [];
      const xml = await fetchXml(config.sitemapUrl);
      const nested = parseSitemapLocs(xml).filter((u) => u.includes("/product/"));
      const all: string[] = [];
      for (const sm of nested) {
        await delay(200);
        try {
          all.push(...parseSitemapLocs(await fetchXml(sm)));
        } catch {
          /* */
        }
      }
      return filterUrls(config, all).map((url) => ({ url }));
    }

    case "rockworld-sitemap": {
      if (!config.sitemapUrl) return [];
      const urls = await collectSitemapUrls(config.sitemapUrl, (url) =>
        isAllowedProductUrl(config, url)
      );
      return urls.map((url) => ({ url }));
    }

    case "prestashop-crawl": {
      const [sitemapUrls, crawledUrls] = await Promise.all([
        collectCommonSitemapUrls(config),
        crawlPrestaShop(
          config.baseUrl,
          config.productUrlTest,
          config.excludeUrl
        ),
      ]);
      return [...new Set([...sitemapUrls, ...crawledUrls])].map((url) => ({ url }));
    }

    case "category-crawl": {
      const [sitemapUrls, crawledUrls] = await Promise.all([
        collectCommonSitemapUrls(config),
        crawlCategoryStore(
          config.baseUrl,
          config.productUrlTest,
          config.excludeUrl,
          config.maxPages,
          config.startUrls
        ),
      ]);
      return [...new Set([...sitemapUrls, ...crawledUrls])].map((url) => ({ url }));
    }

    default:
      return [];
  }
}

/** Pobiera wszystkie URL-e produktów z WooCommerce uwzględniając paginację sitemapów. */
async function collectWcSitemapUrls(config: StoreConfig): Promise<string[]> {
  const base = config.baseUrl.replace(/\/$/, "");
  const productTest = (url: string) => isAllowedProductUrl(config, url);

  // Kolejność: sitemap indeks (listuje wszystkie strony) → bezpośredni URL z configa
  const indexCandidates = [
    `${base}/sitemap_index.xml`,
    `${base}/sitemap.xml`,
    `${base}/wp-sitemap.xml`,          // WordPress core (nowszy WC)
    `${base}/product_sitemap.xml`,
  ];

  const indexResults = await Promise.allSettled(
    indexCandidates.map((u) => collectSitemapUrls(u, productTest))
  );
  const fromIndex = [
    ...new Set(
      indexResults.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    ),
  ];

  // Numeryczna paginacja jako fallback (product-sitemap1.xml, product-sitemap2.xml…)
  const numberedBase = config.sitemapUrl
    ? config.sitemapUrl.replace(/\d*\.xml$/i, "")
    : `${base}/product-sitemap`;
  const fromNumbered = await collectNumberedSitemaps(numberedBase, productTest);

  // Również bezpośredni URL z configa (pierwsza strona)
  const fromDirect = config.sitemapUrl
    ? await collectSitemapUrls(config.sitemapUrl, productTest).catch(() => [] as string[])
    : [];

  return [...new Set([...fromIndex, ...fromNumbered, ...fromDirect])];
}

/** Iteruje przez product-sitemap1.xml, product-sitemap2.xml, … do 404. */
async function collectNumberedSitemaps(
  baseUrl: string,
  productTest: (url: string) => boolean,
  maxPages = 200
): Promise<string[]> {
  const all: string[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${baseUrl}${page}.xml`;
    try {
      const urls = await collectSitemapUrls(url, productTest);
      if (urls.length === 0) break;
      all.push(...urls);
      if (urls.length < 500) break; // ostatnia strona — mniej niż połowa limitu WC
    } catch {
      break; // 404 lub błąd = brak kolejnych stron
    }
    await delay(150);
  }
  return all;
}

async function collectCommonSitemapUrls(config: StoreConfig): Promise<string[]> {
  const base = config.baseUrl.replace(/\/$/, "");
  const candidates = [
    config.sitemapUrl,
    `${base}/sitemap.xml`,
    `${base}/sitemap_index.xml`,
    `${base}/wp-sitemap.xml`,
    `${base}/product-sitemap.xml`,
    `${base}/product-sitemap1.xml`,
    `${base}/1_index_sitemap.xml`,
  ].filter(Boolean) as string[];

  const uniqueCandidates = [...new Set(candidates)];
  const results = await Promise.allSettled(
    uniqueCandidates.map((sitemapUrl) =>
      collectSitemapUrls(sitemapUrl, (url) => isAllowedProductUrl(config, url))
    )
  );

  return [
    ...new Set(
      results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : []
      )
    ),
  ];
}

function dedupeItems(items: CollectedItem[]): CollectedItem[] {
  const map = new Map<string, CollectedItem>();
  for (const i of items) map.set(i.url.split("?")[0], i);
  return [...map.values()];
}

function isAllowedProductUrl(config: StoreConfig, url: string): boolean {
  if (!config.productUrlTest.test(url)) return false;
  if (config.excludeUrl?.test(url)) return false;
  return true;
}
