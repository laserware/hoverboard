import { builtinModules } from "node:module";

import { defineConfig } from "tsup";

export default defineConfig(() => {
  const commonOptions = {
    bundle: true,
    clean: true,
    external: [
      "electron",
      // And also exclude Node internals from build.
      ...builtinModules.flatMap((name) => [name, `node:${name}`]),
    ],
    minify: false,
    sourcemap: true,
    tsconfig: "./tsconfig.build.json",
  };

  return [
    {
      ...commonOptions,
      name: "Main (ESM)",
      dts: true,
      entry: { main: "src/main/index.ts" } as any,
      format: "esm",
      outExtension: () => ({ js: ".mjs" }),
      platform: "node",
      target: "esnext",
      treeshake: true,
    },
    {
      ...commonOptions,
      name: "Main (CJS)",
      dts: false,
      entry: { main: "src/main/index.ts" } as any,
      format: "cjs",
      outExtension: () => ({ js: ".cjs" }),
      platform: "node",
    },
    {
      ...commonOptions,
      name: "Renderer (ESM)",
      dts: true,
      entry: { renderer: "src/renderer/index.ts" },
      format: "esm",
      outExtension: () => ({ js: ".mjs" }),
      platform: "browser",
      target: "esnext",
      treeshake: true,
    },
  ];
});
