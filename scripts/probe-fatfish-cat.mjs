import * as cheerio from "cheerio";

const r = await fetch("https://fatfish.pl/kolowrotki.html", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const $ = cheerio.load(await r.text());
const links = [];
$("a[href]").each((_, el) => {
  const h = $(el).attr("href") || "";
  if (/\.html/.test(h) && h.length > 10) links.push(h);
});
const unique = [...new Set(links)].slice(0, 15);
console.log(unique);
