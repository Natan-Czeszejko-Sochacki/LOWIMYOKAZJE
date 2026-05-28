import * as cheerio from "cheerio";

const q = "Shimano Stradic FM 4000";
const url = `https://www.ceneo.pl/;szukaj-${encodeURIComponent(q)}`;
const r = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html",
  },
});
console.log("status", r.status, url);
const html = await r.text();
const $ = cheerio.load(html);
const products = [];
$(".cat-prod-row, [data-productid], .js_product").slice(0, 3);
$("a").each((_, el) => {
  const href = $(el).attr("href") || "";
  if (href.includes("/") && /stradic|Stradic/.test($(el).text())) {
    products.push({ href, text: $(el).text().trim().slice(0, 60) });
  }
});
console.log("matches", products.slice(0, 8));
const og = $('meta[property="og:image"]').attr("content");
console.log("og", og);
