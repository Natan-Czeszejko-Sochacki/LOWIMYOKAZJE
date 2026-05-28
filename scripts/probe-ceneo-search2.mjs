import * as cheerio from "cheerio";

const url = "https://www.ceneo.pl/;szukaj-Shimano%20Stradic%20FM%204000";
const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 Chrome/120" } });
const $ = cheerio.load(await r.text());

$("[data-productid], .cat-prod-row__name a, h2 a, .search-results .product-name a").each(
  (_, el) => {
    const href = $(el).attr("href") || "";
    const name = $(el).text().trim().replace(/\s+/g, " ");
    console.log(href, name.slice(0, 70));
  }
);

// all links with numeric path
const seen = new Set();
$("a[href]").each((_, el) => {
  const href = $(el).attr("href") || "";
  const m = href.match(/^\/(\d{6,})(?:[?#]|$)/);
  if (m && !seen.has(m[1])) {
    seen.add(m[1]);
    const name = $(el).text().trim().replace(/\s+/g, " ");
    if (name.length > 15) console.log("ID", m[1], name.slice(0, 70));
  }
});
