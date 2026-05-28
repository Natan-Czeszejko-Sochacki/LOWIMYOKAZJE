import * as cheerio from "cheerio";

const productUrl = "https://www.ceneo.pl/192516485";
const r = await fetch(productUrl, {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" },
});
const $ = cheerio.load(await r.text());
const img =
  $('meta[property="og:image"]').attr("content") ||
  $(".product-top__image img").attr("src");
console.log("image", img);

const offers = [];
$("a").each((_, el) => {
  const href = $(el).attr("href") || "";
  const text = $(el).text().trim();
  if (
    href.includes("redirect.ceneo.pl") ||
    /fishing-mart|wedkarski|allans|major-fishing/i.test(text + href)
  ) {
    offers.push({ href: href.slice(0, 120), text: text.slice(0, 50) });
  }
});
console.log("offers sample", offers.slice(0, 15));

// shop names on page
const shops = [];
$(".product-offer__shop-name, [class*='shop']").each((_, el) => {
  const t = $(el).text().trim();
  if (t.length > 2 && t.length < 40) shops.push(t);
});
console.log("shops", [...new Set(shops)].slice(0, 20));
