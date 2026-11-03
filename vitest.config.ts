import { defineConfig } from "vitest/config";
// Separate from vite.config.ts: that one loads the Cloudflare plugin, which vitest cannot host.
export default defineConfig({ test: { include: ["tests/**/*.test.ts"] } });
