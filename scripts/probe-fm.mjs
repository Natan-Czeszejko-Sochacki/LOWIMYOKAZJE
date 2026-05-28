import * as cheerio from "cheerio";

const url = "https://www.fishing-mart.com.pl/szukaj?search=Stradic+FM+4000";
const r = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" },
});
const $ = cheerio.load(await r.text());
const links = [];
$('a[href*="/s/"]').each((_, el) => {
  links.push({ href: $(el).attr("href"), text: $(el).text().trim().slice(0, 80) });
});
console.log(links.filter((l) => /stradic/i.test(l.href + l.text)).slice(0, 10));
