import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "**/__fakes__/**",
        "**/__mocks__/**",
        "**/__tests__/**",
        "**/__e2e__/**",
        "**/*.json",
        "**/*.js",
      ],
      provider: "istanbul",
      reporter: ["lcov"],
    },
    environment: "jsdom",
    globals: true,
    setupFiles: resolve(import.meta.dirname, "vitest.setup.mts"),
  },
});
