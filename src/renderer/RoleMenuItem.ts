import type { MenuItemConstructorOptions } from "electron";

import type { ContextMenuItem, OnContextMenuItemClick } from "../types.ts";

/**
 * Options for creating a role context menu item. Note that a label or click
 * event cannot be specified, as the role represents a system operation.
 */
export interface RoleMenuItemOptions {
  /** Role for the menu item. */
  role: Required<MenuItemConstructorOptions["role"]>;

  /** Indicates if the menu item is enabled or disabled. */
  enabled?: boolean;

  /** Indicates if the menu item is visible. */
  visible?: boolean;

  /** Optional keyboard shortcut to use for the menu item. */
  accelerator?: string;
}

/**
 * Role-based menu item. See {@link https://www.electronjs.org/docs/latest/api/menu-item#menuitemrole|roles}
 * in the Electron docs for more information.
 * @class
 */
export class RoleMenuItem implements ContextMenuItem {
  readonly #options: RoleMenuItemOptions;

  constructor(options: RoleMenuItemOptions) {
    this.#options = options;
  }

  // We return an empty string because role menu items don't need a unique ID.
  public get id(): string {
    return "";
  }

  // Role menu items cannot have a custom click event because it performs a
  // system operation.
  public get click(): OnContextMenuItemClick | undefined {
    return undefined;
  }

  public get template(): MenuItemConstructorOptions {
    return this.#options;
  }
}
