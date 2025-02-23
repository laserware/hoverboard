import { mount } from "svelte";

import { registerElements } from "../../../src/elements/index";

import App from "./App.svelte";

registerElements();

const app = mount(App, { target: document.getElementById("app") });

export default app;
