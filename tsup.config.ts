import { builtinModules } from "node:module";

import { defineConfig } from "tsup";

export default defineConfig(() => {
  const commonOptions = {
    clean: true,
    entry: {
      main: "src/main/index.ts",
      renderer: "src/renderer/index.ts",
    },
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
      dts: false,
      format: "esm",
      outExtension: () => ({ js: ".mjs" }),
      target: "esnext",
      treeshake: true,
    },
    {
      ...commonOptions,
      dts: true,
      format: "cjs",
      outExtension: () => ({ js: ".cjs" }),
    },
  ];
});
