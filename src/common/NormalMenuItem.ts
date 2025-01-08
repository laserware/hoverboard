import { uuid } from "@laserware/arcade";
import type { MenuItemConstructorOptions } from "electron";

import type {
  MenuItemOf,
  MenuItemPlacementOptions,
  MenuType,
  OnMenuItemClick,
} from "./types.js";
import { getTemplateByProcess } from "./utilities.js";

/**
 * Options for creating a normal menu item.
 *
 * @public
 */
export interface NormalMenuItemOptions<T extends MenuType>
  extends MenuItemPlacementOptions {
  /** Optional ID. If omitted, a random UUID is used. */
  id?: string;

  /** Label to display in the menu item. */
  label: string;

  /** Indicates if the menu item is enabled or disabled. */
  enabled?: boolean;

  /** Indicates if the menu item is visible. */
  visible?: boolean;

  /** Optional keyboard shortcut to use for the menu item. */
  accelerator?: string;

  /** Sublabel to display in the menu item. */
  sublabel?: string;

  /** Optional icon image path or data URL to use for the menu item. */
  icon?: string;

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

  /** Optional click handler for the menu item. */
  click?: OnMenuItemClick<T>;
}

/**
 * Represents a normal menu item. A "normal" item is essentially a button that
 * can be enabled/disabled or hidden and performs some operation in response
 * to a click event.
 *
 * @public
 */
export class NormalMenuItem<T extends MenuType> implements MenuItemOf<T> {
  readonly #id: string;
  readonly #options: NormalMenuItemOptions<T>;

  constructor(options: NormalMenuItemOptions<T>) {
    this.#id = options.id ?? uuid();
    this.#options = options;
  }

  public get id(): string {
    return this.#id;
  }

  public get click(): OnMenuItemClick<T> | undefined {
    return this.#options.click;
  }

  public get template(): MenuItemConstructorOptions {
    return getTemplateByProcess({
      ...this.#options,
      id: this.#id,
      type: "normal",
    });
  }
}
