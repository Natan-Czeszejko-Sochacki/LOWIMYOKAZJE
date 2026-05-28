import * as cheerio from "cheerio";

const r = await fetch("https://fatfish.pl/sitemap.xml", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const urls = [...(await r.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const prods = urls.filter(
  (u) =>
    u.endsWith(".html") &&
    !u.includes("lista-") &&
    !u.includes("kontakt") &&
    !u.includes("regulamin") &&
    u.split("/").length >= 4
);
console.log("product-like", prods.length);
console.log(prods.slice(0, 8));

if (prods[50]) {
  const pr = await fetch(prods[50], { headers: { "User-Agent": "Mozilla/5.0" } });
  const $ = cheerio.load(await pr.text());
  console.log("h1", $("h1").text().trim());
  console.log("price", $(".price, .cena, [itemprop=price]").first().text());
  console.log("og", $('meta[property="og:image"]').attr("content"));
}
