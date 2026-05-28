import * as cheerio from "cheerio";

const tests = [
  ["fatfish", "https://fatfish.pl/sitemap.xml", /product|\.html$/i],
  ["wedkarski-sm", "https://wedkarski.com/1_index_sitemap.xml", /product/i],
  ["mietus-sm", "https://sklep-mietus.pl/1_index_sitemap.xml", /product/i],
  ["roach", "https://roach-shop.pl/1_index_sitemap.xml", /product/i],
  ["drapieznik", "https://sklepdrapieznik.pl/sitemap.xml", /product/i],
];

const UA = "Mozilla/5.0 Chrome/120";

for (const [name, smUrl, filter] of tests) {
  try {
    const r = await fetch(smUrl, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
    let xml = await r.text();
    let urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    if (urls.length < 50 && urls.some((u) => u.includes("sitemap"))) {
      const child = urls.find((u) => /product/i.test(u)) || urls[0];
      const r2 = await fetch(child, { headers: { "User-Agent": UA } });
      xml = await r2.text();
      urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    }

    const products = urls.filter((u) => filter.test(u)).slice(0, 3);
    console.log("\n", name, "total", urls.length, "product samples:", products.length);
    for (const u of products.slice(0, 2)) {
      const pr = await fetch(u, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
      const $ = cheerio.load(await pr.text());
      const price =
        $('[itemprop="price"]').attr("content") ||
        $(".price").first().text().trim() ||
        $('[data-price]').attr("data-price");
      const img =
        $('meta[property="og:image"]').attr("content") ||
        $("img.product-image").first().attr("src");
      const title = $("h1").first().text().trim().slice(0, 50);
      console.log(" ", title, price, img?.slice(0, 60));
    }
  } catch (e) {
    console.log(name, "ERR", e.message);
  }
}
