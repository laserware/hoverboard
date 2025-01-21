import type { ContextMenuEvent } from "./ContextMenuEvent.js";
import type { SubmenuMenuItem } from "./SubmenuMenuItem.js";

const idGenerator = (() => {
  let value = 1;

  return {
    next: () => `menu-item-${(value++).toString()}`,
  };
})();

/**
 * Role for a {@linkcode RoleMenuItem}. See the [Electron documentation](https://www.electronjs.org/docs/latest/api/menu-item#roles)
 * for additional information.
 *
 * @remarks
 * Some of the menu item roles don't work in a context menu, so if clicking
 * on it doesn't do anything, that's why.
 */
export type ContextMenuItemRole = Electron.MenuItemConstructorOptions["role"];

/**
 * Type of context menu item. See the [Electron documentation](https://www.electronjs.org/docs/latest/api/menu-item#menuitemtype)
 * for additional information.
 */
export type ContextMenuItemType = Electron.MenuItemConstructorOptions["type"];

/**
 * This is the click event fired in the _renderer_ process when a context menu
 * item is clicked. It has a different signature than the [`click` property](https://www.electronjs.org/docs/latest/api/menu-item#menuitemclick)
 * of the `MenuItemConstructorOptions`.
 */
export type OnContextMenuItemClick = (
  menuItem: ContextMenuItem,
  event: ContextMenuEvent,
) => void | Promise<void>;

/**
 * Options for creating a base context menu item.
 *
 * @internal
 */
export interface ContextMenuItemOptions {
  /**
   * ID of the menu item. Not all menu items require an ID (i.e. separator and
   * role), but all other menu items will need an ID to capture the click event,
   * so we set it here.
   */
  id?: string;

  /**
   * Sets the visibility of the menu item.
   */
  visible?: boolean;

  /**
   * Inserts this item before the item with the specified ID. If the referenced item
   * doesn't exist the item will be inserted at the end of the menu. Also implies
   * that the menu item in question should be placed in the same "group" as the item.
   */
  before?: string[];

  /**
   * Inserts this item after the item with the specified ID. If the referenced item
   * doesn't exist the item will be inserted at the end of the menu.
   */
  after?: string[];

  /**
   * Provides a means for a single context menu to declare the placement of their
   * containing group before the containing group of the item with the specified ID.
   */
  beforeGroupContaining?: string[];

  /**
   * Provides a means for a single context menu to declare the placement of their
   * containing group after the containing group of the item with the specified ID.
   */
  afterGroupContaining?: string[];
}

/**
 * Base context menu item from which other context menu items are derived.
 */
export class ContextMenuItem {
  /** ID of the menu item. */
  public id: string;

  /**
   * Type of the context menu item. See the [Electron documentation](https://www.electronjs.org/docs/latest/api/menu-item#menuitemtype)
   * for additional information.
   */
  public type: ContextMenuItemType;

  /** Indicates if the menu item is visible. */
  public visible: boolean | undefined;

  /**
   * Inserts this item before the item with the specified ID. If the referenced item
   * doesn't exist the item will be inserted at the end of the menu. Also implies
   * that the menu item in question should be placed in the same "group" as the item.
   */
  public before: string[] | undefined;

  /**
   * Inserts this item after the item with the specified ID. If the referenced item
   * doesn't exist the item will be inserted at the end of the menu.
   */
  public after: string[] | undefined;

  /**
   * Provides a means for a single context menu to declare the placement of their
   * containing group before the containing group of the item with the specified ID.
   */
  public beforeGroupContaining: string[] | undefined;

  /**
   * Provides a means for a single context menu to declare the placement of their
   * containing group after the containing group of the item with the specified ID.
   */
  public afterGroupContaining: string[] | undefined;

  /**
   * Parent submenu of the menu item. If the menu item is not part of a submenu,
   * this is undefined.
   */
  public parent: SubmenuMenuItem | undefined;

  constructor(
    options: ContextMenuItemOptions = {},
    type: ContextMenuItemType = undefined,
  ) {
    this.id = options.id ?? idGenerator.next();
    this.type = type;
    this.visible = options.visible;

    this.before = options.before;
    this.after = options.after;
    this.beforeGroupContaining = options.beforeGroupContaining;
    this.afterGroupContaining = options.afterGroupContaining;
  }

  /**
   * Converts the properties of this menu item to a template that can be sent
   * to the main process to build the menu.
   */
  public toTemplate(): Electron.MenuItemConstructorOptions {
    const template: Electron.MenuItemConstructorOptions = { id: this.id };

    if (this.type !== undefined) {
      template.type = this.type;
    }

    if (this.visible !== undefined) {
      template.visible = this.visible;
    }

    if (this.before !== undefined) {
      template.before = this.before;
    }

    if (this.after !== undefined) {
      template.after = this.after;
    }

    if (this.beforeGroupContaining !== undefined) {
      template.beforeGroupContaining = this.beforeGroupContaining;
    }

    if (this.afterGroupContaining !== undefined) {
      template.afterGroupContaining = this.afterGroupContaining;
    }

    return template;
  }
}
