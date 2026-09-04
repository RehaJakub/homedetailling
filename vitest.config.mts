import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@homedetailing/ui": `${import.meta.dirname}/design-system/src/index.ts`,
      "@": import.meta.dirname,
    },
  },
  test: {
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    environment: "node",
  },
});
