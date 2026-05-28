import { stores } from "@/lib/stores";

export const metadata = {
  title: "Sklepy wędkarskie",
};

export default function StoresPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Sklepy partnerskie</h1>
      <p className="mt-2 max-w-2xl text-water-400">
        Porównujemy wyłącznie sprawdzone polskie firmy wędkarskie — sklepy
        internetowe i sieci stacjonarne, które działają legalnie i mają
        wieloletnią reputację wśród wędkarzy.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {stores.map((store) => (
          <article
            key={store.id}
            className="rounded-xl border border-water-700 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{store.name}</h2>
                {store.founded && (
                  <p className="text-xs text-water-500">od {store.founded} roku</p>
                )}
              </div>
              <span className="rounded-full bg-accent-950 px-3 py-1 text-xs font-semibold text-accent-500">
                {store.trustScore}% zaufania
              </span>
            </div>
            <p className="mt-3 text-sm text-water-400">{store.description}</p>
            <a
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-accent-500 hover:underline"
            >
              {store.url.replace(/^https?:\/\//, "")} →
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
