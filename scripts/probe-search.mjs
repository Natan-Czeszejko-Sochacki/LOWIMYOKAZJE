import * as cheerio from "cheerio";

const tests = [
  { store: "fishing-mart", url: "https://www.fishing-mart.com.pl/szukaj?search=Shimano+Stradic+FM+4000" },
  { store: "wedkarski", url: "https://wedkarski.com/szukaj?szukaj=Shimano+Stradic+4000" },
  { store: "allans", url: "https://www.allans.pl/?s=Shimano+Stradic+4000" },
  { store: "major", url: "https://major-fishing.pl/?s=Shimano+Stradic" },
  { store: "max-fish", url: "https://max-fish.pl/?s=Shimano+Stradic" },
  { store: "nizel", url: "https://nizel.pl/pl/search?search=Shimano+Stradic" },
  { store: "mietus", url: "https://www.sklep-mietus.pl/pl/szukaj?search=Shimano+Stradic" },
  { store: "wedkomania", url: "https://wedkomania.pl/?s=Shimano+Stradic" },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

for (const t of tests) {
  try {
    const res = await fetch(t.url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    const html = await res.text();
    const $ = cheerio.load(html);
    const links = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim().slice(0, 60);
      if (/stradic|shimano/i.test(href + text) && !/szukaj|search|\?s=|login|cart/i.test(href)) {
        links.push({ href, text });
      }
    });
    console.log("\n===", t.store, res.status, "links:", links.length, "===");
    console.log(links.slice(0, 5));
  } catch (e) {
    console.log("\n===", t.store, "ERR", e.message);
  }
}
