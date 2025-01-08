import type { MenuItemConstructorOptions } from "electron";

import type {
  MenuItemOf,
  MenuItemPlacementOptions,
  MenuType,
  OnMenuItemClick,
} from "./types.js";

export type SeparatorMenuItemOptions = MenuItemPlacementOptions;

/**
 * Represents a separator menu item. A separator menu item is only used
 * to split up groups of menu items and cannot be interacted with.
 *
 * @public
 */
export class SeparatorMenuItem<T extends MenuType> implements MenuItemOf<T> {
  readonly #options: SeparatorMenuItemOptions;

  constructor(options?: SeparatorMenuItemOptions) {
    this.#options = options ?? {};
  }

  // We return an empty string because separator menu items don't need a
  // unique ID.
  public get id(): string {
    return "";
  }

  public get click(): OnMenuItemClick<T> | undefined {
    return undefined;
  }

  public get template(): MenuItemConstructorOptions {
    return { type: "separator", ...this.#options };
  }
}
