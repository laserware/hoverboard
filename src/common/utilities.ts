import type { MenuItemConstructorOptions } from "electron";

import type { MenuType, OnMenuItemClick } from "./types.js";

/** Returns true if in the main process. */
export function isMainProcess(): boolean {
  return typeof window === "undefined" || process.type === "browser";
}

/** Returns true if in the renderer process. */
export function isRendererProcess(): boolean {
  return typeof window !== "undefined" || process.type !== "browser";
}

/**
 * Returns the menu item template based on the current process the menu item
 * is built in.
 */
export function getTemplateByProcess<T extends MenuType>(
  template: Omit<MenuItemConstructorOptions, "click"> & {
    click?: OnMenuItemClick<T> | undefined;
  },
): MenuItemConstructorOptions {
  const { click, ...rest } = template;

  if (isMainProcess()) {
    return { ...rest, click } as MenuItemConstructorOptions;
  } else {
    return rest;
  }
}
