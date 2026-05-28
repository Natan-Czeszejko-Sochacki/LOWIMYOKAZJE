import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 Chrome/120";

async function probeStore(name, indexUrl, productFilter) {
  const r = await fetch(indexUrl, { headers: { "User-Agent": UA } });
  const xml = await r.text();
  const childMaps = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => productFilter(u));

  console.log("\n===", name, "child sitemaps:", childMaps.length);

  for (const sm of childMaps.slice(0, 2)) {
    const r2 = await fetch(sm, { headers: { "User-Agent": UA } });
    const x2 = await r2.text();
    const urls = [...x2.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const products = urls.filter((u) => /-\d+\.html|\/p\/|\/pl\/p\//i.test(u) || /\d{3,}/.test(u));
    console.log(" ", sm.split("/").pop(), "urls", urls.length, "sample:", urls.slice(0, 3));

    const testUrl = urls.find((u) => u.includes(".html") && !u.includes("sitemap")) || urls[10];
    if (!testUrl) continue;

    const pr = await fetch(testUrl, { headers: { "User-Agent": UA } });
    const $ = cheerio.load(await pr.text());
    console.log(
      "   PRODUCT:",
      $("h1").text().trim().slice(0, 50),
      "| price:",
      $('[itemprop="price"]').attr("content") || $(".projector_price_value").text().trim().slice(0, 20),
      "| img:",
      ($('meta[property="og:image"]').attr("content") || "").slice(0, 55)
    );
  }
}

await probeStore("wedkarski", "https://wedkarski.com/1_index_sitemap.xml", (u) => u.includes("sitemap"));
await probeStore("mietus", "https://sklep-mietus.pl/1_index_sitemap.xml", (u) => u.includes("sitemap"));
await probeStore("roach", "https://roach-shop.pl/1_index_sitemap.xml", (u) => u.includes("sitemap"));
