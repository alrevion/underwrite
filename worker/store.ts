// SQLite in one Durable Object, behind the small part of the D1 API that db.ts uses.
// Why not D1: the free plan allows ten databases per account, and this runs on the free plan.
// ponytail: one object serialises all writes, fine for a demo; shard by run id if traffic ever needs it.
import { DurableObject } from "cloudflare:workers";
import m1 from "../migrations/0001_init.sql?raw";
import m2 from "../migrations/0002_locks.sql?raw";
import m3 from "../migrations/0003_lock_owner.sql?raw";

const MIGRATIONS = [m1, m2, m3];

export class Store extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env as never);
    ctx.blockConcurrencyWhile(async () => {
      const sql = ctx.storage.sql;
      sql.exec("CREATE TABLE IF NOT EXISTS schema_version (v INTEGER NOT NULL)");
      const v = (sql.exec("SELECT v FROM schema_version").toArray()[0]?.v as number | undefined) ?? 0;
      MIGRATIONS.slice(v).forEach((m) => sql.exec(m));
      sql.exec("DELETE FROM schema_version");
      sql.exec("INSERT INTO schema_version (v) VALUES (?)", MIGRATIONS.length);
    });
  }
  query(sql: string, params: (string | number | null)[]): Record<string, SqlStorageValue>[] {
    return this.ctx.storage.sql.exec(sql, ...params).toArray();
  }
}

export function storeDb(ns: DurableObjectNamespace<Store>): D1Database {
  const stub = ns.get(ns.idFromName("main"));
  const statement = (sql: string, params: (string | number | null)[]) => ({
    bind: (...p: (string | number | null)[]) => statement(sql, p),
    first: async () => ((await stub.query(sql, params)) as unknown[])[0] ?? null,
    run: async () => { await stub.query(sql, params); return { success: true }; },
  });
  return { prepare: (sql: string) => statement(sql, []) } as unknown as D1Database;
}
