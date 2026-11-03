import { app } from "./index";
import type { Env } from "./db";
import { Store, storeDb } from "./store";

export { Store };
export default {
  fetch: (req: Request, env: Env & { STORE: DurableObjectNamespace<Store> }, ctx: ExecutionContext) =>
    app.fetch(req, { ...env, DB: storeDb(env.STORE) }, ctx),
};
