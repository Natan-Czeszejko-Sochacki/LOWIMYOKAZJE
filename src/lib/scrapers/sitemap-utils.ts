import { gunzipSync } from "zlib";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export function parseSitemapLocs(xml: string): string[] {
  return [
    ...xml.matchAll(/<loc>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/loc>/gi),
  ].map((m) => m[1].trim());
}

export type IAIProductEntry = {
  url: string;
  name?: string;
  imageUrl?: string;
};

/** Parsuje sitemap IdoSell (Presta/IAI) z metadanymi obrazów */
export function parseIAIProductSitemap(xml: string): IAIProductEntry[] {
  const entries: IAIProductEntry[] = [];
  const urlBlocks = xml.split(/<url>/i).slice(1);

  for (const block of urlBlocks) {
    const locMatch = block.match(
      /<loc>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/loc>/i
    );
    if (!locMatch) continue;
    const url = locMatch[1].trim();

    const titleMatch = block.match(
      /<image:title>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/image:title>/i
    );
    const imgMatch = block.match(
      /<image:loc>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/image:loc>/i
    );

    let name = titleMatch?.[1]?.trim();
    if (name) {
      name = name
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    }

    entries.push({
      url,
      name,
      imageUrl: imgMatch?.[1]?.trim(),
    });
  }

  return entries;
}

export async function fetchXml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/xml,text/xml,*/*" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const body = Buffer.from(await res.arrayBuffer());
  const isGzipped = body[0] === 0x1f && body[1] === 0x8b;
  return (isGzipped ? gunzipSync(body) : body).toString("utf-8");
}

export async function collectSitemapUrls(
  indexOrSitemapUrl: string,
  productTest: (url: string) => boolean
): Promise<string[]> {
  return [...new Set(await collectSitemapUrlsRecursive(indexOrSitemapUrl, productTest))];
}

async function collectSitemapUrlsRecursive(
  sitemapUrl: string,
  productTest: (url: string) => boolean,
  depth = 0
): Promise<string[]> {
  const xml = await fetchXml(sitemapUrl);
  const locs = parseSitemapLocs(xml);
  const productUrls = locs.filter(productTest);
  const childSitemaps = locs.filter((u) => isSitemapUrl(u) && !productTest(u));

  if (depth >= 3 || childSitemaps.length === 0) return productUrls;

  const all = [...productUrls];
  for (const child of childSitemaps) {
    await delay(200);
    try {
      all.push(...(await collectSitemapUrlsRecursive(child, productTest, depth + 1)));
    } catch {
      /* skip unavailable child sitemap */
    }
  }

  return all;
}

function isSitemapUrl(url: string): boolean {
  return /sitemap|\.xml(?:\.gz)?$/i.test(url);
}

export function slugToTitle(slug: string): string {
  return slug
    .replace(/^\d+-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
