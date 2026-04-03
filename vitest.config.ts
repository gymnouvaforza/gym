import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@mobile-contracts": path.resolve(__dirname, "./packages/mobile-contracts/src/index.ts"),
    },
  },
  test: {
    exclude: [
      "apps/mobile/**",
      "apps/medusa/**",
      "**/node_modules/**",
      "node_modules/**",
      "tests/e2e/**",
      "playwright.config.ts",
      "playwright-report/**",
      "test-results/**",
    ],
    environment: "node",
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
});
