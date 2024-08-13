import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

Object.defineProperty(window, "require", {
  value: () => ({
    ipcRenderer: {
      invoke: vi.fn(),
      send: vi.fn(),
      sendSync: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  }),
});
