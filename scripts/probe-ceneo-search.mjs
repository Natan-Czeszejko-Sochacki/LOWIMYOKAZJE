import * as cheerio from "cheerio";

const url = "https://www.ceneo.pl/;szukaj-Shimano%20Stradic%20FM%204000";
const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 Chrome/120" } });
const $ = cheerio.load(await r.text());

const items = [];
$("a").each((_, el) => {
  const href = $(el).attr("href") || "";
  if (/^\/\d+$/.test(href)) {
    items.push({
      id: href.slice(1),
      name: $(el).text().trim().replace(/\s+/g, " ").slice(0, 80),
    });
  }
});
const unique = [...new Map(items.map((i) => [i.id, i])).values()];
console.log(unique.slice(0, 6));
