import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  dts: true,
  format: "esm",
  minify: false,
  outExtension: () => ({ js: ".mjs" }),
  platform: "browser",
  sourcemap: true,
  target: "esnext",
  treeshake: true,
  tsconfig: "./tsconfig.build.json",
});
