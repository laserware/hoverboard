import type { MenuItemConstructorOptions } from "electron";

import type {
  MenuItemOf,
  MenuItemPlacementOptions,
  MenuItemRole,
  MenuType,
  OnMenuItemClick,
} from "./types.js";

/**
 * Options for creating a role menu item. Note that a label or click
 * event cannot be specified, as the role represents a system operation.
 *
 * @public
 */
export interface RoleMenuItemOptions extends MenuItemPlacementOptions {
  /** Optional ID for the menu item. */
  id?: string;

  /** Role for the menu item. */
  role: Required<MenuItemRole>;

  /** Optional keyboard shortcut to use for the menu item. */
  accelerator?: string;

  /**
   * Hover text for this menu item.
   *
   * Only supported on macOS.
   */
  toolTip?: string;

  /**
   * Prevents the accelerator from triggering the item if the item is not visible
   * when value is `false`.
   *
   * Only supported on macOS.
   */
  acceleratorWorksWhenHidden?: boolean;

  /**
   * If false, the accelerator won't be registered with the system, but it will
   * still be displayed. Defaults to true.
   *
   * Only supported on Linux and Windows.
   */
  registerAccelerator?: boolean;
}

/**
 * Role-based menu item. See {@link https://www.electronjs.org/docs/latest/api/menu-item#menuitemrole|roles}
 * in the Electron docs for more information.
 *
 * @public
 */
export class RoleMenuItem<T extends MenuType> implements MenuItemOf<T> {
  readonly #options: RoleMenuItemOptions;

  constructor(options: RoleMenuItemOptions) {
    this.#options = options;
  }

  public get id(): string {
    return this.#options.id ?? "";
  }

  // Role menu items cannot have a custom click event because it performs a
  // system operation.
  public get click(): OnMenuItemClick<T> | undefined {
    return undefined;
  }

  public get template(): MenuItemConstructorOptions {
    return this.#options;
  }
}
