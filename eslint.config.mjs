import { fileURLToPath } from "node:url";

import { filePatterns, getBaseConfigs } from "@laserware/eslint-config/base";

const thisDirPath = fileURLToPath(new URL(".", import.meta.url));

const baseConfigs = getBaseConfigs({
  tsConfigRootDir: thisDirPath,
  tsConfigFiles: ["./tsconfig.json"],
});

export default [
  ...baseConfigs,
  {
    files: filePatterns.base,
    rules: {
      "@typescript-eslint/no-require-imports": ["error", { allow: ["electron"] }],
    },
  },
  {
    ignores: ["eslint.config.mjs", "example/**", "**/*.snap"],
  },
];
