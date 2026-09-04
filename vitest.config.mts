import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL, TEST_JWT_SECRET, TEST_REGISTRATION_CODE } from "./tests/integration/env.mts";

export default defineConfig({
  resolve: {
    alias: {
      "@homedetailing/ui": `${import.meta.dirname}/design-system/src/index.ts`,
      "@": import.meta.dirname,
    },
  },
  test: {
    projects: [
      {
        // Pure logic next to the modules. Never opens a database connection.
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
        },
      },
      {
        // Route handlers against the `homedetailing_test` database from compose.yml.
        // `env` overrides whatever `bun run` loaded from .env, so the dev database
        // is never touched.
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          globalSetup: ["tests/integration/global-setup.ts"],
          setupFiles: ["tests/integration/setup.ts"],
          fileParallelism: false,
          env: {
            DATABASE_URL: TEST_DATABASE_URL,
            JWT_SECRET: TEST_JWT_SECRET,
            ADMIN_REGISTRATION_CODE: TEST_REGISTRATION_CODE,
            NODE_ENV: "test",
          },
        },
      },
    ],
  },
});
