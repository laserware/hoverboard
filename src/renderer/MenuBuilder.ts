import {
  CheckboxMenuItem,
  type CheckboxMenuItemOptions,
} from "./CheckboxMenuItem.js";
import type { ContextMenuItem } from "./ContextMenuItem.js";
import {
  NormalMenuItem,
  type NormalMenuItemOptions,
} from "./NormalMenuItem.js";
import { RadioMenuItem, type RadioMenuItemOptions } from "./RadioMenuItem.js";
import { RoleMenuItem, type RoleMenuItemOptions } from "./RoleMenuItem.js";
import {
  SeparatorMenuItem,
  type SeparatorMenuItemOptions,
} from "./SeparatorMenuItem.js";
import {
  SubmenuMenuItem,
  type SubmenuMenuItemOptions,
} from "./SubmenuMenuItem.js";

export type MenuBuilderFunction = (builder: MenuBuilder) => MenuBuilder;

/**
 * Used to build a context menu with a builder function, rather than specifying
 * an array of menu items.
 *
 * @internal
 */
export class MenuBuilder {
  readonly #items: Set<ContextMenuItem> = new Set();

  /** Unique items in the context menu. */
  public get items(): Set<ContextMenuItem> {
    return this.#items;
  }

  /**
   * Adds the specified `item` to the context menu.
   *
   * @param item Context menu item to add.
   */
  public add(item: ContextMenuItem): this {
    this.#items.add(item);
    return this;
  }

  /**
   * Iterates over the specified `values` and calls the `onValue` callback to
   * add menu items to the menu.
   *
   * This is useful for adding multiple submenu items in a builder function.
   *
   * @param values Array of values of any type to iterate over.
   * @param onValue Callback called for each value.
   *
   * @example
   * const menu = contextMenu((builder) =>
   *    builder.submenu(
   *      {
   *        id: "submenu",
   *        label: "Radio Options",
   *        sublabel: "This is a sublabel",
   *      },
   *      (builder) =>
   *        builder.map(["1", "2", "3"], (value) =>
   *          builder.radio({
   *            label: `Option ${value}`,
   *            checked: activeOption === value,
   *            click() {
   *              console.log(`Clicked ${value}`);
   *            },
   *          }),
   *        ),
   *      ),
   * );
   */
  public map<T>(values: T[], onValue: (value: T) => any): this {
    for (const value of values) {
      onValue(value);
    }

    return this;
  }

  /** Adds a checkbox menu item to the menu with the specified options. */
  public checkbox(options: CheckboxMenuItemOptions): this {
    this.#items.add(new CheckboxMenuItem(options));
    return this;
  }

  /** Adds a normal menu item to the menu with the specified options. */
  public normal(options: NormalMenuItemOptions): this {
    this.#items.add(new NormalMenuItem(options));
    return this;
  }

  /** Adds a radio menu item to the menu with the specified options. */
  public radio(options: RadioMenuItemOptions): this {
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

  /**
   * Adds a submenu menu item to the context menu with the specified `options`
   * and containing the specified `items`.
   */
  public submenu(
    options: SubmenuMenuItemOptions,
    items: ContextMenuItem[],
  ): this;

  /**
   * Adds a submenu menu item to the context menu with the specified `options`
   * and items added with the specified `build` function.
   */
  public submenu(
    options: SubmenuMenuItemOptions,
    build: MenuBuilderFunction,
  ): this;

  public submenu(
    options: SubmenuMenuItemOptions,
    init: ContextMenuItem[] | MenuBuilderFunction,
  ): this {
    this.#items.add(new SubmenuMenuItem(options, init as any));
    return this;
  }
}
