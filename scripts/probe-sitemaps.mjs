import * as cheerio from "cheerio";

const stores = [
  ["angryfish", "https://angryfish.pl"],
  ["big-fish", "https://big-fish.pl"],
  ["carpride", "https://carpride.pl"],
  ["centrum", "https://centrumwedkarskie.pl"],
  ["e-amur", "https://e-amur.pl"],
  ["ehooks", "https://ehooks.pl"],
  ["fatfish", "https://fatfish.pl"],
  ["feederland", "https://feederland.pl"],
  ["karpiowa-chata", "https://karpiowachata.pl"],
  ["karpiowy", "https://www.karpiowy.pl"],
  ["matchsklep", "https://matchsklep.pl"],
  ["moonfin", "https://moonfin.pl"],
  ["rm-rybka", "https://rmrybka.pl"],
  ["rockworld", "https://www.rockworld.pl"],
  ["drapieznik", "https://sklepdrapieznik.pl"],
  ["mietus", "https://www.sklep-mietus.pl"],
  ["rybka", "https://skleprybka.pl"],
  ["wedkarski", "https://wedkarski.com"],
];

const UA = "Mozilla/5.0 Chrome/120";
const sitemapPaths = [
  "/sitemap.xml",
  "/sitemap_index.xml",
  "/sitemap-products.xml",
  "/sitemap/sitemap.xml",
  "/pl/sitemap.xml",
];

for (const [id, base] of stores) {
  let found = null;
  for (const p of sitemapPaths) {
    try {
      const r = await fetch(base + p, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) {
        const t = await r.text();
        if (t.includes("<url") || t.includes("<sitemap")) {
          found = p + " " + (t.match(/<loc>/g)?.length ?? 0) + " locs";
          const sample = [...t.matchAll(/<loc>([^<]+)<\/loc>/g)].slice(0, 2).map((m) => m[1]);
          console.log(id, found, sample);
          break;
        }
      }
    } catch {}
  }
  if (!found) {
    try {
      const r = await fetch(base + "/robots.txt", { headers: { "User-Agent": UA } });
      const txt = await r.text();
      const sm = txt.match(/Sitemap:\s*(.+)/gi);
      console.log(id, "robots", sm?.slice(0, 2) || "none");
    } catch {
      console.log(id, "no sitemap");
    }
  }
}
