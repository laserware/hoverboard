import { builtinModules } from "node:module";

import { type Options, defineConfig } from "tsup";

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

  const esm = (
    name: string,
    options: Omit<Options, "entry"> & { entry: Record<string, any> },
  ): Options => {
    return {
      ...commonOptions,
      name: `${name} (ESM)`,
      dts: true,
      format: "esm",
      outExtension: () => ({ js: ".mjs" }),
      target: "esnext",
      treeshake: true,
      ...options,
    };
  };

  const cjs = (
    name: string,
    options: Omit<Options, "entry"> & { entry: Record<string, any> },
  ): Options => {
    return {
      ...commonOptions,
      name: `${name} (CJS)`,
      dts: true,
      format: "cjs",
      outExtension: () => ({ js: ".cjs" }),
      platform: "node",
      ...options,
    };
  };

  return [
    esm("main", { entry: { main: "src/main/index.ts" }, platform: "node" }),
    cjs("main", { entry: { main: "src/main/index.ts" } }),
    esm("preload", {
      entry: { preload: "src/sandbox/preload.ts" },
      platform: "node",
    }),
    cjs("preload", {
      entry: { preload: "src/sandbox/preload.ts" },
    }),
    esm("renderer", {
      entry: { renderer: "src/renderer/index.ts" },
      platform: "browser",
    }),
    esm("elements", {
      entry: { elements: "src/elements/index.ts" },
      platform: "browser",
    }),
  ];
});
