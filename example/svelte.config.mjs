// For some reason, we need to use the `.mjs` extension here, otherwise
// Svelte complains about how `import` statements aren't allowed.
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
};
