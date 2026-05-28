const r = await fetch("https://fatfish.pl/sitemap.xml", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const t = await r.text();
const urls = [...t.matchAll(/<loc>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/loc>/g)].map((m) => m[1].trim());

const prods = urls.filter((u) => /,p\d+\.html$/.test(u) && !/,(p3|p4|p5|p6|p8|p11)\.html/.test(u));
console.log("products ,pID:", prods.length);
console.log(prods.slice(0, 5));

if (prods[100]) {
  const cheerio = (await import("cheerio")).default;
  const pr = await fetch(prods[100], { headers: { "User-Agent": "Mozilla/5.0" } });
  const $ = cheerio.load(await pr.text());
  console.log("sample", prods[100]);
  console.log("h1", $("h1").text().trim());
  console.log(
    "price",
    $('[itemprop="price"]').attr("content") || $(".price").text().trim().slice(0, 30)
  );
  console.log("og", $('meta[property="og:image"]').attr("content")?.slice(0, 70));
}
