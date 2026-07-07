import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Load .env (Supabase URL + keys) before any test module imports.
    setupFiles: ["dotenv/config"],
    // Single fork so beforeAll setup + assertions run in a deterministic order
    // against the shared local database.
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
