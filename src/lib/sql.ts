import postgres, { type ParameterOrJSON } from "postgres";

type PostgresConnectOptions = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: "require" | undefined;
  max: number;
  idle_timeout: number;
  connect_timeout: number;
  prepare: boolean;
  max_pipeline: number;
};

type SqlClient = ReturnType<typeof postgres>;

const globalForPg = globalThis as typeof globalThis & {
  __catalogSql?: SqlClient;
};

function isServerless(): boolean {
  return Boolean(process.env.VERCEL);
}

/** Hasło z DATABASE_PASSWORD — bez wklejania w URL (nawiasy w haśle). */
export function resolvePostgresConfig(
  baseUrl: string,
  passwordOverride?: string
): string | PostgresConnectOptions {
  const password = (passwordOverride ?? process.env.DATABASE_PASSWORD)?.trim();
  const parsed = new URL(baseUrl);
  const isSupabase = baseUrl.includes("supabase");
  const port = parsed.port ? Number(parsed.port) : 5432;
  const usePooler = port === 6543 || parsed.hostname.includes("pooler");

  const shared = {
    ssl: (isSupabase ? "require" : undefined) as "require" | undefined,
    max: isServerless() ? 1 : 3,
    idle_timeout: isServerless() ? 0 : 20,
    connect_timeout: 15,
    prepare: false,
    max_pipeline: usePooler ? 0 : 1,
  };

  if (!password) {
    if (!parsed.password && process.env.NODE_ENV === "production") {
      console.error(
        "[db] Brak DATABASE_PASSWORD na produkcji — ustaw w Vercel obok DATABASE_URL."
      );
    }
    return baseUrl;
  }

  return {
    host: parsed.hostname,
    port,
    database: parsed.pathname.replace(/^\//, "") || "postgres",
    username: decodeURIComponent(parsed.username),
    password,
    ...shared,
  };
}

function createClient(): SqlClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? "Brak DATABASE_URL. Ustaw w Vercel (Connect → Transaction pooler, port 6543)."
        : "Brak DATABASE_URL w .env.local."
    );
  }
  const config = resolvePostgresConfig(url);
  if (typeof config === "string") {
    const usePooler =
      config.includes("pooler") || config.includes(":6543");
    return postgres(config, {
      prepare: false,
      max_pipeline: usePooler ? 0 : 1,
      max: isServerless() ? 1 : 3,
      idle_timeout: isServerless() ? 0 : 20,
      connect_timeout: 15,
      ssl: config.includes("supabase") ? "require" : undefined,
    } as postgres.Options<Record<string, never>>);
  }
  return postgres(config as postgres.Options<Record<string, never>>);
}

export function getSql(): SqlClient {
  if (!globalForPg.__catalogSql) {
    globalForPg.__catalogSql = createClient();
  }
  return globalForPg.__catalogSql;
}

/** Zamienia placeholdery SQLite (?) na Postgres ($1, $2, …). */
export function toPg(sql: string): string {
  let n = 0;
  return sql.replace(/\?/g, () => `$${++n}`);
}

function pgParams(params: unknown[]): ParameterOrJSON<never>[] {
  return params as ParameterOrJSON<never>[];
}

export async function queryRows<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  return getSql().unsafe(toPg(sql), pgParams(params)) as Promise<T[]>;
}

export async function queryOne<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await queryRows<T>(sql, params);
  return rows[0];
}

export async function execute(sql: string, params: unknown[] = []): Promise<number> {
  const rows = await getSql().unsafe(toPg(sql), pgParams(params));
  return rows.count ?? 0;
}

export async function withTransaction<T>(
  fn: (tx: postgres.TransactionSql) => Promise<T>
): Promise<T> {
  return getSql().begin(fn) as Promise<T>;
}

export async function checkDbConnection(): Promise<{
  ok: boolean;
  listings?: number;
  error?: string;
  hint?: string;
}> {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        ok: false,
        error: "Brak DATABASE_URL",
        hint: "Vercel → Settings → Environment Variables",
      };
    }
    if (!process.env.DATABASE_PASSWORD?.trim() && !new URL(process.env.DATABASE_URL).password) {
      return {
        ok: false,
        error: "Brak DATABASE_PASSWORD",
        hint: "Dodaj hasło bazy jako osobną zmienną (nie w URL).",
      };
    }
    const row = await queryOne<{ c: number }>(
      "SELECT COUNT(*)::int AS c FROM listings"
    );
    return { ok: true, listings: row?.c ?? 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: message,
      hint: message.includes("password")
        ? "Sprawdź DATABASE_PASSWORD w Vercel (Production)."
        : "Użyj pooler :6543 i redeploy po zmianie env.",
    };
  }
}
