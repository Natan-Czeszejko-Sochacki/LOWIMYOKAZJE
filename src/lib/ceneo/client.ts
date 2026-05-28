import * as cheerio from "cheerio";
import type { Product } from "../types";
import { getSearchQuery, matchStoreIdFromDomain } from "../store-urls";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const FETCH_OPTS = {
  headers: {
    "User-Agent": UA,
    Accept: "text/html",
    "Accept-Language": "pl-PL,pl;q=0.9",
  },
  signal: AbortSignal.timeout(20000),
} as const;

export type CeneoOffer = {
  storeId: string;
  shopDomain: string;
  price: number;
  originalPrice?: number;
  url: string;
};

export type CeneoProductMatch = {
  ceneoId: string;
  name: string;
  imageUrl: string;
  offers: CeneoOffer[];
};

function parsePolishPrice(text: string): number | null {
  const cleaned = text.replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  const match = cleaned.match(/(\d+[,.]?\d*)/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function scoreMatch(productName: string, query: string): number {
  const a = productName.toLowerCase();
  const b = query.toLowerCase();
  const tokens = b.split(/\s+/).filter((t) => t.length > 2);
  if (!tokens.length) return 0;
  const hits = tokens.filter((t) => a.includes(t)).length;
  return hits / tokens.length;
}

export async function searchCeneoProduct(
  product: Product
): Promise<CeneoProductMatch | null> {
  const query = getSearchQuery(product);
  const searchUrl = `https://www.ceneo.pl/;szukaj-${encodeURIComponent(query)}`;

  await delay(400);

  const res = await fetch(searchUrl, FETCH_OPTS);
  if (!res.ok) return null;

  const $ = cheerio.load(await res.text());
  const candidates: { id: string; name: string; score: number }[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const m = href.match(/^\/(\d{6,})$/);
    if (!m) return;
    const name = $(el).text().trim().replace(/\s+/g, " ");
    if (name.length < 12) return;
    const score = scoreMatch(name, query);
    if (score >= 0.45) candidates.push({ id: m[1], name, score });
  });

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  return fetchCeneoProductPage(best.id, product);
}

export async function fetchCeneoProductPage(
  ceneoId: string,
  product: Product
): Promise<CeneoProductMatch | null> {
  await delay(500);

  const res = await fetch(`https://www.ceneo.pl/${ceneoId}`, FETCH_OPTS);
  if (!res.ok) return null;

  const html = await res.text();
  const $ = cheerio.load(html);

  const imageUrl =
    $('meta[property="og:image"]').attr("content") ||
    $("img.product-image, .product-top__image img").first().attr("src") ||
    "";

  if (!imageUrl || imageUrl.includes("socialMediaImage")) {
    const imgMatch = html.match(
      /image\.ceneostatic\.pl\/data\/products\/\d+\/[^"'\s]+\.jpg/
    );
    if (imgMatch) {
      return buildMatch(ceneoId, product, `https://${imgMatch[0]}`, $);
    }
  }

  const fullImage = imageUrl.startsWith("http")
    ? imageUrl
    : imageUrl
      ? `https://www.ceneo.pl${imageUrl}`
      : "";

  return buildMatch(ceneoId, product, fullImage, $);
}

function buildMatch(
  ceneoId: string,
  product: Product,
  imageUrl: string,
  $: cheerio.CheerioAPI
): CeneoProductMatch {
  const offers: CeneoOffer[] = [];
  const seen = new Set<string>();

  $(".js_product-offer").each((_, el) => {
    const shopDomain = ($(el).attr("data-shopurl") || "").toLowerCase();
    if (!shopDomain) return;

    const storeId = matchStoreIdFromDomain(shopDomain);
    if (!storeId || seen.has(storeId)) return;

    const priceText = $(el).find(".price").first().text();
    const price = parsePolishPrice(priceText);
    if (!price) return;

    const clickHref =
      $(el).find("a.go-to-shop, a[href*='Click/Offer']").first().attr("href") ||
      $(el).find("a[href*='Click/Offer']").first().attr("href");

    const url = clickHref
      ? clickHref.startsWith("http")
        ? clickHref
        : `https://www.ceneo.pl${clickHref}`
      : `https://${shopDomain}`;

    seen.add(storeId);
    offers.push({ storeId, shopDomain, price, url });
  });

  const name =
    $("h1").first().text().trim() || product.name;

  return {
    ceneoId,
    name,
    imageUrl: imageUrl || product.image,
    offers,
  };
}

export async function resolveFinalShopUrl(ceneoClickUrl: string): Promise<string> {
  try {
    const res = await fetch(ceneoClickUrl, {
      ...FETCH_OPTS,
      redirect: "manual",
    });
    const location = res.headers.get("location");
    if (location && location.startsWith("http")) return location;
    if (location) return new URL(location, ceneoClickUrl).href;
  } catch {
    /* keep ceneo redirect */
  }
  return ceneoClickUrl;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
