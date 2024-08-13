"use strict";

module.exports = {
  extends: ["@laserware/eslint-config"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  ignorePatterns: ["*.js", "*.cjs"]
};
