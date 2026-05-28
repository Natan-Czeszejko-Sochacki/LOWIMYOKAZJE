import * as cheerio from "cheerio";
import { delay } from "./sitemap-utils";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const PRODUCT_LINK_SELECTOR = [
  "article.product-miniature a[href]",
  ".product-miniature a[href]",
  ".ajax_block_product a[href]",
  ".product_list a[href]",
  ".product a[href]",
  ".product-item a[href]",
  ".productbox a[href]",
  ".product-inner a[href]",
  ".product-name a[href]",
  "a.product-name[href]",
  "a.thumbnail[href]",
  ".thumbnail-container a[href]",
  "[data-product-id] a[href]",
].join(",");

const BLOCKED_URL_PARTS =
  /(\/(?:koszyk|cart|konto|account|logowanie|login|rejestracja|register|kontakt|contact|blog|regulamin|terms|privacy|polityka|wysylka|delivery|platnosci|payment|panel|favourites|wishlist|porownaj|compare)(?:[/?#]|$)|controller=|add_to_cart|logout|mailto:|tel:)/i;

const DEFAULT_CRAWL_PAGE_SAFETY_LIMIT = 2500;

export async function crawlCategoryStore(
  baseUrl: string,
  productTest: RegExp,
  excludeTest?: RegExp,
  maxPages?: number,
  startUrls: string[] = []
): Promise<string[]> {
  const found = new Set<string>();
  const queue: string[] = [...new Set([baseUrl, ...startUrls])];
  const visited = new Set<string>();
  const origin = new URL(baseUrl).origin;
  const pageLimit = maxPages ?? DEFAULT_CRAWL_PAGE_SAFETY_LIMIT;

  while (queue.length > 0 && visited.size < pageLimit) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $(PRODUCT_LINK_SELECTOR).each((_, el) => {
        const abs = toStoreUrl($(el).attr("href") || "", url, origin);
        if (abs && isAllowedProduct(abs, productTest, excludeTest)) {
          found.add(abs.split("?")[0]);
        }
      });

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href") || "";
        if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
        try {
          const abs = new URL(href, url).href;
          if (!abs.startsWith(origin)) return;
          if (excludeTest?.test(abs)) return;
          if (isAllowedProduct(abs, productTest, excludeTest)) {
            found.add(abs.split("?")[0]);
          } else if (shouldFollow(abs)) {
            if (!visited.has(abs) && !queue.includes(abs)) queue.push(abs);
          }
        } catch {
          /* invalid */
        }
      });
    } catch {
      /* skip */
    }
    await delay(150);
  }

  return [...found];
}

export async function crawlPrestaShop(
  baseUrl: string,
  productTest: RegExp,
  excludeTest?: RegExp
): Promise<string[]> {
  const found = new Set<string>();
  const home = `${baseUrl.replace(/\/$/, "")}/pl/`;
  const res = await fetch(home, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return crawlCategoryStore(baseUrl, productTest, excludeTest);

  const $ = cheerio.load(await res.text());
  const categories: string[] = [];
  $("a[href*='/pl/']").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (/\/pl\/\d+-/.test(href) && !isAllowedProduct(href, productTest, excludeTest)) {
      try {
        categories.push(new URL(href, baseUrl).href);
      } catch {
        /* */
      }
    }
  });

  const uniqueCats = [...new Set([home, ...categories])];
  for (const cat of uniqueCats) {
    for (let page = 1; ; page++) {
      const pageUrl = page === 1 ? cat : `${cat}?page=${page}`;
      try {
        const pr = await fetch(pageUrl, {
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(15_000),
        });
        if (!pr.ok) break;
        const $$ = cheerio.load(await pr.text());
        const before = found.size;
        $$(PRODUCT_LINK_SELECTOR).each((_, el) => {
          const abs = toStoreUrl($$(el).attr("href") || "", pageUrl, new URL(baseUrl).origin);
          if (abs && isAllowedProduct(abs, productTest, excludeTest)) {
            found.add(abs.split("?")[0]);
          }
        });
        $$("a[href]").each((_, el) => {
          const href = $$(el).attr("href") || "";
          try {
            const abs = new URL(href, baseUrl).href;
            if (isAllowedProduct(abs, productTest, excludeTest)) {
              found.add(abs.split("?")[0]);
            }
          } catch {
            /* */
          }
        });
        if (found.size === before) break;
      } catch {
        break;
      }
      await delay(120);
    }
  }

  return [...found];
}

function toStoreUrl(href: string, pageUrl: string, origin: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }
  try {
    const abs = new URL(href, pageUrl).href;
    return abs.startsWith(origin) ? abs : null;
  } catch {
    return null;
  }
}

function isAllowedProduct(
  url: string,
  productTest: RegExp,
  excludeTest: RegExp | undefined
): boolean {
  if (excludeTest?.test(url)) return false;
  if (BLOCKED_URL_PARTS.test(url)) return false;
  if (productTest.test(url)) return true;
  return false;
}

function shouldFollow(url: string): boolean {
  if (BLOCKED_URL_PARTS.test(url)) return false;
  return (
    /\/(c|kategoria|category|cat|kategoria-produktu|producenci|producent|manufacturer|brand)\b/i.test(url) ||
    /\/pl\/c\//i.test(url) ||
    /(?:[?&](?:page|p)=\d+|\/page\/\d+|strona-\d+|,\d+\.html|c\d+\.html)/i.test(url) ||
    /\/(?:new|nowe-produkty|promocje|wyprzedaz|bestsellery|best-sales|prices-drop)(?:[/?#]|$)/i.test(url)
  );
}
