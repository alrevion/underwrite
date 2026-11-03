import type { Batch, Run } from "../shared/contract";

export type Env = {
  DB: D1Database;
  ASSETS?: Fetcher;
  MODEL_API_KEY?: string;
  MUSE_BASE_URL: string;
  MUSE_MODEL: string;
  MUSE_IMAGE_MODEL: string;
  DAILY_RUN_LIMIT?: string; // new runs and screenings per IP per day
  DAILY_IP_UNITS?: string; // all paid model calls per IP per day
  DAILY_GLOBAL_LIMIT?: string; // all paid model calls per day, whole deployment
};

async function load<T>(db: D1Database, table: "runs" | "batches", id: string): Promise<T | null> {
  const row = await db.prepare(`SELECT data FROM ${table} WHERE id = ?`).bind(id).first<{ data: string }>();
  return row ? (JSON.parse(row.data) as T) : null;
}

async function save(db: D1Database, table: "runs" | "batches", v: { id: string; createdAt: number }) {
  await db
    .prepare(`INSERT INTO ${table} (id, data, created_at) VALUES (?1, ?2, ?3) ON CONFLICT(id) DO UPDATE SET data = ?2`)
    .bind(v.id, JSON.stringify(v), v.createdAt)
    .run();
}

export const loadRun = (db: D1Database, id: string) => load<Run>(db, "runs", id);
export const saveRun = (db: D1Database, r: Run) => save(db, "runs", r);
export const loadBatch = (db: D1Database, id: string) => load<Batch>(db, "batches", id);
export const saveBatch = (db: D1Database, b: Batch) => save(db, "batches", b);

// Atomic per-key counter. Returns the count after the increment.
export async function bump(db: D1Database, key: string): Promise<number> {
  const row = await db
    .prepare("INSERT INTO usage (ip_day, count) VALUES (?1, 1) ON CONFLICT(ip_day) DO UPDATE SET count = count + 1 RETURNING count")
    .bind(key)
    .first<{ count: number }>();
  return row?.count ?? 1;
}
export const unbump = (db: D1Database, key: string) =>
  db.prepare("UPDATE usage SET count = MAX(count - 1, 0) WHERE ip_day = ?").bind(key).run();

// Cross-isolate mutex in D1. Returns an owner token if we hold the lock, null if someone else does.
// The lock expires on its own after ttlMs; unlock only deletes it while the token still matches.
export async function lock(db: D1Database, key: string, ttlMs: number): Promise<string | null> {
  const now = Date.now();
  const owner = crypto.randomUUID();
  const row = await db
    .prepare("INSERT INTO locks (key, expires, owner) VALUES (?1, ?2, ?4) ON CONFLICT(key) DO UPDATE SET expires = ?2, owner = ?4 WHERE locks.expires < ?3 RETURNING key")
    .bind(key, now + ttlMs, now, owner)
    .first();
  return row ? owner : null;
}
export const unlock = (db: D1Database, key: string, owner: string) =>
  db.prepare("DELETE FROM locks WHERE key = ?1 AND owner = ?2").bind(key, owner).run();

// Appends atomically, so concurrent screenings of one batch never overwrite each other.
export const appendItem = (db: D1Database, id: string, item: unknown) =>
  db.prepare("UPDATE batches SET data = json_insert(data, '$.items[#]', json(?2)) WHERE id = ?1").bind(id, JSON.stringify(item)).run();

// Once per day (first caller wins the marker row): drop old counters and expired locks.
export async function cleanupDaily(db: D1Database, today: string) {
  if ((await bump(db, `cleanup:${today}`)) !== 1) return;
  await db.prepare("DELETE FROM usage WHERE substr(ip_day, -10) < ?").bind(today).run();
  await db.prepare("DELETE FROM locks WHERE expires < ?").bind(Date.now()).run();
}
