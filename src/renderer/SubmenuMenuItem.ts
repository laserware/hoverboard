import { uuid } from "@laserware/arcade";
import type { MenuItemConstructorOptions } from "electron";

import type {
  ContextMenuItem,
  OnContextMenuItemClick,
  ContextMenuItemPlacementOptions,
} from "../types.ts";

import {
  CheckboxMenuItem,
  type CheckboxMenuItemOptions,
} from "./CheckboxMenuItem.ts";
import {
  NormalMenuItem,
  type NormalMenuItemOptions,
} from "./NormalMenuItem.ts";
import { RadioMenuItem, type RadioMenuItemOptions } from "./RadioMenuItem.ts";
import { RoleMenuItem, type RoleMenuItemOptions } from "./RoleMenuItem.ts";
import {
  SeparatorMenuItem,
  type SeparatorMenuItemOptions,
} from "./SeparatorMenuItem.ts";

/**
 * Function called with the specified context menu builder to add menu items to
 * the associated context menu.
 *
 * @public
 */
export type BuilderFunction = (
  builder: ContextMenuBuilder,
) => ContextMenuBuilder;

/**
 * Options for creating a submenu context menu item.
 *
 * @public
 */
// prettier-ignore
export interface SubmenuMenuItemOptions extends ContextMenuItemPlacementOptions {
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

  /** Optional click handler for the menu item. */
  click?: OnContextMenuItemClick;
}

/**
 * Allows you to add menu items of different types to a context menu/submenu
 * using method chaining. Each menu item creator returns the builder. You
 * can ignore the return value if you need to add items dynamically.
 *
 * Only the type is exported. You should never use this class directly, but you
 * need the type for a function signature.
 *
 * @example
 * import { ContextMenu, type ContextMenuBuilder } from "@freeflyer/context-menus/browser";
 *
 * function addCustomItems(builder: ContextMenuBuilder): void {
 *   builder
 *    .normal({ label: "Custom 1" })
 *    .normal({ label: "Custom 2" })
 *    .normal({ label: "Custom 3" });
 * }
 *
 * ContextMenu.create("Custom", (builder) => {
 *   builder.normal({ label: "First Item" });
 *
 *   addCustomItems(builder);
 *
 *   return builder;
 * });
 *
 * @internal
 */
export class ContextMenuBuilder {
  readonly #items: Set<ContextMenuItem> = new Set();

  /** Menu items in the context menu or submenu this builder is associated with. */
  public get items(): Set<ContextMenuItem> {
    return this.#items;
  }

  /** Adds the specified menu item to the context menu. */
  public add(menuItem: ContextMenuItem): this {
    this.#items.add(menuItem);
    return this;
  }

  /** Adds a checkbox menu item to the context menu with the specified options. */
  public checkbox(options: CheckboxMenuItemOptions): this {
    this.#items.add(new CheckboxMenuItem(options));
    return this;
  }

  /** Adds a normal menu item to the context menu with the specified options. */
  public normal(options: NormalMenuItemOptions): this {
    this.#items.add(new NormalMenuItem(options));
    return this;
  }

  /** Adds a radio menu item to the context menu with the specified options. */
  public radio(options: RadioMenuItemOptions): this {
    this.#items.add(new RadioMenuItem(options));
    return this;
  }

  /** Adds a role menu item to the context menu with the specified options. */
  public role(options: RoleMenuItemOptions): this {
    this.#items.add(new RoleMenuItem(options));
    return this;
  }

  /** Adds a separator menu item to the context menu. */
  public separator(options?: SeparatorMenuItemOptions): this {
    this.#items.add(new SeparatorMenuItem(options));
    return this;
  }

  /** Adds a submenu menu item to the context menu. */
  public submenu(
    options: SubmenuMenuItemOptions,
    build: BuilderFunction,
  ): this {
    this.#items.add(new SubmenuMenuItem(options, build));
    return this;
  }
}

/**
 * Represents a submenu menu item. Submenus can contain checkbox/normal/radio
 * menu items as well as other submenu menu items.
 *
 * @public
 */
export class SubmenuMenuItem implements ContextMenuItem {
  readonly #builder: ContextMenuBuilder;
  readonly #id: string;
  readonly #options: SubmenuMenuItemOptions;

  /**
   * Creates a submenu menu item. The builder function is used to add menu items
   * to the submenu.
   */
  constructor(options: SubmenuMenuItemOptions, builder: BuilderFunction) {
    this.#builder = builder(new ContextMenuBuilder());
    this.#id = options.id ?? uuid();
    this.#options = options;
  }

  public get id(): string {
    return this.#id;
  }

  public get click(): OnContextMenuItemClick | undefined {
    return this.#options.click;
  }

  public get items(): Set<ContextMenuItem> {
    return this.#builder.items;
  }

  public get template(): MenuItemConstructorOptions {
    const { click, ...rest } = this.#options;

    const submenu = [];
    for (const menuItem of this.items.values()) {
      submenu.push(menuItem.template);
    }

    return { ...rest, id: this.#id, submenu, type: "submenu" };
  }
}
