import { uuid } from "@laserware/arcade";
import type { MenuItemConstructorOptions } from "electron";

import type {
  ContextMenuItem,
  OnContextMenuItemClick,
  ContextMenuItemPlacementOptions,
} from "../types.ts";

/**
 * Options for creating a radio context menu item.
 *
 * @public
 */
export interface RadioMenuItemOptions extends ContextMenuItemPlacementOptions {
  /** Optional ID. If omitted, a random UUID is used. */
  id?: string;

  /** Label to display in the menu item. */
  label: string;

  /** Indicates whether the radio is checked. */
  checked: boolean;

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
  click?: OnContextMenuItemClick;
}

/**
 * Represents a radio context menu item. A radio menu item is similar to a
 * {@link CheckboxMenuItem} except only one instance in a radio group can be
 * marked as checked (i.e. a single select list).
 *
 * @public
 */
export class RadioMenuItem implements ContextMenuItem {
  readonly #id: string;
  readonly #options: RadioMenuItemOptions;

  constructor(options: RadioMenuItemOptions) {
    this.#id = options.id ?? uuid();
    this.#options = options;
  }

  public get id(): string {
    return this.#id;
  }

  public get click(): OnContextMenuItemClick | undefined {
    return this.#options.click;
  }

  public get template(): MenuItemConstructorOptions {
    const { click, ...rest } = this.#options;
    return { ...rest, id: this.#id, type: "radio" };
  }
}
