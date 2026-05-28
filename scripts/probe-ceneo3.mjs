import * as cheerio from "cheerio";

const productUrl = "https://www.ceneo.pl/192516485";
const r = await fetch(productUrl, {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" },
});
const $ = cheerio.load(await r.text());

$(".js_product-offer").each((_, el) => {
  const shopUrl = $(el).attr("data-shopurl");
  const price = $(el).find(".price, .product-offer__price").first().text().trim();
  const shop = $(el).find(".product-offer__shop-name, .store-name").text().trim();
  if (shopUrl) console.log({ shop, shopUrl, price: price.slice(0, 30) });
});
