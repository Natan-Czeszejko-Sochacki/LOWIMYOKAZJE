import * as cheerio from "cheerio";

const productUrl = "https://www.ceneo.pl/192516485";
const r = await fetch(productUrl, {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" },
});
const html = await r.text();
const $ = cheerio.load(html);
const redirects = [];
html.match(/redirect\.ceneo\.pl[^"'\s]+/g)?.forEach((m) => redirects.push(m.slice(0, 80)));
console.log("redirects", [...new Set(redirects)].slice(0, 8));

$("[data-shopurl], [data-shop-name], .product-offer").each((i, el) => {
  if (i > 5) return;
  console.log($(el).attr("class"), $(el).html()?.slice(0, 200));
});

// JSON-LD
const scripts = [];
$("script[type='application/ld+json']").each((_, el) => {
  scripts.push($(el).html()?.slice(0, 500));
});
console.log("ld+json count", scripts.length);
