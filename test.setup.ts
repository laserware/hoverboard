// noinspection JSConstantReassignment

import { afterAll, afterEach, beforeAll } from "bun:test";

// @ts-ignore
import JSDOM from "jsdom";

const globalProperties: any[] = [];

beforeAll(() => {
  const jsdom = new JSDOM.JSDOM(
    `<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>`,
    {
      pretendToBeVisual: true,
      url: "http://localhost:3000",
    },
  );

  const { window } = jsdom;
  const { document } = window;

  if (globalProperties.length === 0) {
    const windowProperties = Object.getOwnPropertyNames(window);

    const validProperties = windowProperties.filter(
      (property) => !property.startsWith("_") && !(property in global),
    );

    globalProperties.push(...validProperties);
  }

  for (const globalProperty of globalProperties) {
    // @ts-ignore
    global[globalProperty] = window[globalProperty];
  }

  global.document = document;
  global.window = window;
  window.console = global.console;
});

afterAll(() => {
  for (const globalProperty of globalProperties) {
    // @ts-ignore
    delete global[globalProperty];
  }
});

// Ensures the DOM is clear after each test.
afterEach(() => {
  document.body.innerHTML = "";
});
