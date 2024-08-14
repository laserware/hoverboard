import type { MenuItemConstructorOptions } from "electron";

import type {
  ContextMenuItem,
  OnContextMenuItemClick,
  ContextMenuItemPlacementOptions,
} from "../types.ts";

export type SeparatorMenuItemOptions = ContextMenuItemPlacementOptions;

/**
 * Represents a separator context menu item. A separator menu item is only used
 * to split up groups of menu items and cannot be interacted with.
 *
 * @public
 */
export class SeparatorMenuItem implements ContextMenuItem {
  readonly #options: SeparatorMenuItemOptions;

  constructor(options?: SeparatorMenuItemOptions) {
    this.#options = options ?? {};
  }

  // We return an empty string because separator menu items don't need a
  // unique ID.
  public get id(): string {
    return "";
  }

  public get click(): OnContextMenuItemClick | undefined {
    return undefined;
  }

  public get template(): MenuItemConstructorOptions {
    return { type: "separator", ...this.#options };
  }
}
