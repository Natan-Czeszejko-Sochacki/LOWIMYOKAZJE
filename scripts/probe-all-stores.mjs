import * as cheerio from "cheerio";
import { createGunzip } from "zlib";
import { Readable } from "stream";

const UA = "Mozilla/5.0 Chrome/120";

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/loc>/gi)].map(
    (m) => m[1].trim()
  );
}

async function fetchText(url, gzip = false) {
  const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  if (!gzip) return r.text();
  const buf = Buffer.from(await r.arrayBuffer());
  return new Promise((res, rej) => {
    const chunks = [];
    Readable.from(buf)
      .pipe(createGunzip())
      .on("data", (c) => chunks.push(c))
      .on("end", () => res(Buffer.concat(chunks).toString("utf8")))
      .on("error", rej);
  });
}

const stores = [
  ["angryfish", "https://sklep347906.shoparena.pl/console/integration/execute/name/GoogleSitemap"],
  ["big-fish", "https://big-fish.pl/sitemap.xml"],
  ["carpride", "https://carpride.pl/product-sitemap.xml"],
  ["centrum", "https://centrumwedkarskie.pl/product-sitemap.xml"],
  ["e-amur", "https://e-amur.pl/product-sitemap.xml"],
  ["ehooks", "https://ehooks.pl/sitemap.xml.gz", true],
  ["feederland", "https://feederland.pl/sitemap.xml"],
  ["karpiowy", "https://karpiowy.pl/1_pl_1_sitemap.xml"],
  ["matchsklep", "https://matchsklep.pl/sitemap.xml"],
  ["moonfin", "https://moonfin.pl/sitemap.xml"],
  ["rockworld", "https://www.rockworld.pl/static/sitemap-all.xml"],
  ["roach", "https://roach-shop.pl/1_pl_1_sitemap.xml"],
  ["wedkarski", "https://wedkarski.com/1_pl_1_sitemap.xml"],
  ["mietus", "https://sklep-mietus.pl/1_pl_1_sitemap.xml"],
];

for (const [id, url, gzip] of stores) {
  try {
    const xml = await fetchText(url, gzip);
    const locs = parseLocs(xml);
    const prods = locs.filter(
      (u) =>
        /\.html$|\/p\/|\/product\/|,\d+\.html|id\d+\.html/i.test(u) &&
        !/post-|page-|category|blog|kontakt|cart/i.test(u)
    );
    console.log(id, "locs", locs.length, "products~", prods.length, prods[0]?.slice(0, 70));
  } catch (e) {
    console.log(id, "ERR", e.message?.slice(0, 50));
  }
}
