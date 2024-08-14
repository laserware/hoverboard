import { builtinModules } from "node:module";

import { defineConfig } from "tsup";

// @ts-ignore
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
      name: "Renderer (MJS)",
      dts: true,
      entry: { renderer: "src/renderer/index.ts" },
      format: "esm",
      outExtension: () => ({ js: ".mjs" }),
      platform: "browser",
      target: "esnext",
      treeshake: true,
    },
    // This config is only for the `/example` project. It doesn't get shipped
    // with the application:
    {
      ...commonOptions,
      name: "Renderer (Example)",
      clean: false,
      dts: false,
      entry: { hoverboard: "src/renderer/index.ts" },
      format: "esm",
      minify: false,
      noExternal: [/laserware/],
      outDir: "./example/src",
      outExtension: () => ({ js: ".mjs" }),
      platform: "browser",
      sourcemap: false,
      target: "esnext",
      treeshake: false,
    },
    {
      ...commonOptions,
      name: "Main (ESM)",
      dts: true,
      entry: { main: "src/main/index.ts" },
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
      entry: { main: "src/main/index.ts" },
      format: "cjs",
      outExtension: () => ({ js: ".cjs" }),
      platform: "node",
    },
  ];
});
