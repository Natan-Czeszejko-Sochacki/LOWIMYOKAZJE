import * as cheerio from "cheerio";

const id = "169159376";
const r = await fetch(`https://www.ceneo.pl/${id}`, {
  headers: { "User-Agent": "Mozilla/5.0 Chrome/120" },
});
const $ = cheerio.load(await r.text());
const img = $('meta[property="og:image"]').attr("content");
console.log("img", img);

$(".js_product-offer").each((_, el) => {
  const shopUrl = $(el).attr("data-shopurl") || "";
  const priceText = $(el).find(".price").first().text().replace(/\s+/g, " ").trim();
  const click = $(el).find("a.go-to-shop, a[href*='Click/Offer']").first().attr("href");
  const shopName = $(el).find(".product-offer__shop-name").text().trim();
  console.log({ shopUrl, shopName, priceText, click: click?.slice(0, 60) });
});
