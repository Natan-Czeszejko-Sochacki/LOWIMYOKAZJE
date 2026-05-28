import * as cheerio from "cheerio";

const candidates = [
  ["angryfish", "https://angryfish.pl"],
  ["angryfish2", "https://www.angryfish.pl"],
  ["bigfish", "https://bigfish.pl"],
  ["bigfish2", "https://www.big-fish.pl"],
  ["carpride", "https://carpride.pl"],
  ["carpride2", "https://www.carpride.pl"],
  ["centrum", "https://centrumwedkarskie.pl"],
  ["e-amur", "https://e-amur.pl"],
  ["ehooks", "https://ehooks.pl"],
  ["fatfish", "https://fatfish.pl"],
  ["feederland", "https://feederland.pl"],
  ["haczykowo", "https://haczykowo.pl"],
  ["karpiowa-chata", "https://karpiowachata.pl"],
  ["karpiowy", "https://karpiowy.pl"],
  ["matchsklep", "https://matchsklep.pl"],
  ["moonfin", "https://moonfin.pl"],
  ["rm-rybka", "https://rmrybka.pl"],
  ["rm-rybka2", "https://www.rmrybka.pl"],
  ["roach", "https://roachshop.pl"],
  ["rockworld", "https://rockworld.pl"],
  ["drapieznik", "https://sklepdrapieznik.pl"],
  ["mietus", "https://www.sklep-mietus.pl"],
  ["rybka", "https://skleprybka.pl"],
  ["wedkarski", "https://wedkarski.com"],
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120";

for (const [id, url] of candidates) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    const html = await r.text();
    const $ = cheerio.load(html);
    const title = $("title").text().trim().slice(0, 60);
    const sitemap = html.includes("sitemap") || $('a[href*="sitemap"]').length;
    console.log("OK", id, r.url, title, sitemap ? "sitemap?" : "");
  } catch (e) {
    console.log("FAIL", id, url, e.message?.slice(0, 40));
  }
}
