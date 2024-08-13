import { uuid } from "@laserware/arcade";
import type { MenuItemConstructorOptions } from "electron";

import type { ContextMenuItem, OnContextMenuItemClick } from "../types.ts";

/**
 * Options for creating a radio context menu item.
 */
export interface RadioMenuItemOptions {
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

  /** Optional click handler for the menu item. */
  click?: OnContextMenuItemClick;
}

/**
 * Represents a radio context menu item. A radio menu item is similar to a
 * {@link CheckboxMenuItem} except only one instance in a radio group can be
 * marked as checked (i.e. a single select list).
 * @class
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
