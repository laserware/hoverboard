import { uuid } from "@laserware/arcade";
import type { MenuItemConstructorOptions } from "electron";

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
import type {
  MenuItemOf,
  MenuItemPlacementOptions,
  MenuItemRole,
  MenuType,
  OnMenuItemClick,
} from "./types.ts";
import { getTemplateByProcess } from "./utilities.ts";

/**
 * Function called with the specified menu builder to add menu items to the
 * associated menu.
 *
 * @public
 */
export type BuilderFunction<T extends MenuType> = (
  builder: MenuBuilder<T>,
) => MenuBuilder<T>;

/**
 * Options for creating a submenu menu item.
 *
 * @public
 */
// prettier-ignore
export interface SubmenuMenuItemOptions<T extends MenuType> extends MenuItemPlacementOptions {
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

  /** Role for the menu item. This can only be specified in {@link ApplicationMenu}. */
  role?: MenuItemRole;

  /** Sublabel to display in the menu item. */
  sublabel?: string;

  /** Optional icon image path or data URL to use for the menu item. */
  icon?: string;

  /** Optional click handler for the menu item. */
  click?: OnMenuItemClick<T>;
}

/**
 * Allows you to add menu items of different types to a menu/submenu
 * using method chaining. Each menu item creator returns the builder. You
 * can ignore the return value if you need to add items dynamically.
 *
 * Only the type is exported. You should never use this class directly, but you
 * need the type for a function signature.
 *
 * @example Context Menu
 * import { ContextMenu, type ContextMenuBuilder } from "@laserware/hoverboard/renderer";
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
export class MenuBuilder<T extends MenuType> {
  readonly #items: Set<MenuItemOf<T>> = new Set();

  /** Menu items in the menu or submenu this builder is associated with. */
  public get items(): Set<MenuItemOf<T>> {
    return this.#items;
  }

  /** Adds the specified menu item to the menu. */
  public add(menuItem: MenuItemOf<T>): this {
    this.#items.add(menuItem);
    return this;
  }

  /** Adds a checkbox menu item to the menu with the specified options. */
  public checkbox(options: CheckboxMenuItemOptions<T>): this {
    this.#items.add(new CheckboxMenuItem(options));
    return this;
  }

  /** Adds a normal menu item to the menu with the specified options. */
  public normal(options: NormalMenuItemOptions<T>): this {
    this.#items.add(new NormalMenuItem(options));
    return this;
  }

  /** Adds a radio menu item to the menu with the specified options. */
  public radio(options: RadioMenuItemOptions<T>): this {
    this.#items.add(new RadioMenuItem(options));
    return this;
  }

  /** Adds a role menu item to the menu with the specified options. */
  public role(options: RoleMenuItemOptions): this {
    this.#items.add(new RoleMenuItem(options));
    return this;
  }

  /** Adds a separator menu item to the menu. */
  public separator(options?: SeparatorMenuItemOptions): this {
    this.#items.add(new SeparatorMenuItem(options));
    return this;
  }

  /** Adds a submenu menu item to the menu. */
  public submenu(
    options: SubmenuMenuItemOptions<T>,
    build: BuilderFunction<T>,
  ): this {
    this.#items.add(new SubmenuMenuItem<T>(options, build));
    return this;
  }
}

/**
 * Represents a submenu menu item. Submenus can contain checkbox/normal/radio
 * menu items as well as other submenu menu items.
 *
 * @public
 */
export class SubmenuMenuItem<T extends MenuType> implements MenuItemOf<T> {
  readonly #builder: MenuBuilder<T>;
  readonly #id: string;
  readonly #options: SubmenuMenuItemOptions<T>;

  /**
   * Creates a submenu menu item. The builder function is used to add menu items
   * to the submenu.
   */
  constructor(options: SubmenuMenuItemOptions<T>, builder: BuilderFunction<T>) {
    this.#builder = builder(new MenuBuilder());
    this.#id = options.id ?? uuid();
    this.#options = options;
  }

  public get id(): string {
    return this.#id;
  }

  public get click(): OnMenuItemClick<T> | undefined {
    return this.#options.click;
  }

  /** Menu items in the menu. */
  public get items(): Set<MenuItemOf<T>> {
    return this.#builder.items;
  }

  public get template(): MenuItemConstructorOptions {
    const submenu = [];
    for (const menuItem of this.items.values()) {
      submenu.push(menuItem.template);
    }

    return getTemplateByProcess({
      ...this.#options,
      id: this.#id,
      submenu,
      type: "submenu",
    } as const);
  }
}
