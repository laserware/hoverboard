import { builtinModules } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, mergeConfig } from "vite";

const rootDirPath = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const [processName, env] = mode.replace("@", "").split("/");

  const SERVER_PORT = 25_000;

  const commonOptions = {
    base: "./",
    define: {
      __ENV__: JSON.stringify(env),
      __DEV_SERVER_PORT__: JSON.stringify(SERVER_PORT),
    },
    build: {
      emptyOutDir: false,
      minify: false,
      rollupOptions: {
        external: [
          "electron",
          // And also exclude Node internals from build.
          ...builtinModules.flatMap((name) => [name, `node:${name}`]),
        ],
        output: {
          entryFileNames: "[name].js",
        },
      },
      sourcemap: true,
    },
  };

  if (processName === "main") {
    return mergeConfig(
      commonOptions,
      {
        build: {
          outDir: join("dist", "main"),
          lib: {
            entry: join("src", "main.ts"),
            formats: ["cjs"],
          },
        },
      },
      false,
    );
  }

  if (processName === "renderer") {
    return mergeConfig(
      commonOptions,
      {
        build: {
          outDir: join("dist", "renderer"),
          rollupOptions: {
            input: resolve(rootDirPath, "index.html"),
          },
        },
        plugins: [
          svelte({ configFile: resolve(rootDirPath, "svelte.config.mjs") }),
        ],
        server: {
          port: SERVER_PORT,
        },
      },
      false,
    );
  }

  if (processName === "preload") {
    return mergeConfig(
      commonOptions,
      {
        build: {
          outDir: join("dist", "preload"),
          lib: {
            entry: join("src", "preload.ts"),
            formats: ["cjs"],
          },
          rollupOptions: {
            treeshake: false,
          },
        },
      },
      false,
    );
  }

  throw new Error(`Invalid process name ${processName}`);
});
