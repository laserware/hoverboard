import type {
  BrowserWindow,
  KeyboardEvent,
  MenuItem,
  MenuItemConstructorOptions,
  Point,
} from "electron";

/**
 * Menu type of the manu. Context menus are created/shown in the renderer process
 * where the click handler code resides. The application menu is created in the
 * main process and represents the menu in the title bar of the application.
 */
export type MenuType = "context" | "application";

/**
 * Role for the menu item (if a {@link RoleMenuItem} or {@link SubmenuMenuItem}
 * with a role).
 */
export type MenuItemRole = MenuItemConstructorOptions["role"];

/**
 * This is the click event fired in the _main_ process when an application menu
 * item is clicked.
 */
export type OnApplicationMenuItemClick = (
  menuItem: MenuItem,
  browserWindow: BrowserWindow | undefined,
  event: KeyboardEvent,
) => void | Promise<void>;

/**
 * This is the click event fired in the _renderer_ process when a context menu
 * item is clicked. It has a different signature than the `click` event from the
 * `MenuItemConstructorOptions`.
 */
export type OnContextMenuItemClick = (
  menuItem: MenuItemConstructorOptions,
  event: KeyboardEvent,
) => void | Promise<void>;

export type OnMenuItemClick<T extends MenuType> = T extends "context"
  ? OnContextMenuItemClick
  : T extends "main"
    ? OnApplicationMenuItemClick
    : never;

/**
 * Options for placing the menu item in a specific location relative to other
 * menu items or groups.
 */
export interface MenuItemPlacementOptions {
  /**
   * Inserts the item before the item with the specified ID. If the referenced
   * item doesn't exist the item will be inserted at the end of the menu.
   * Also implies that the menu item in question should be placed in the
   * same “group” as the item.
   */
  before?: string[];

  /**
   * Inserts the item after the item with the specified ID. If the referenced
   * item doesn't exist the item will be inserted at the end of the menu.
   */
  after?: string[];

  /**
   * Provides a means for a single menu to declare the placement of their
   * containing group before the containing group of the item with the specified ID.
   */
  beforeGroupContaining?: string[];

  /**
   * Provides a means for a single menu to declare the placement of their
   * containing group after the containing group of the item with the specified ID.
   */
  afterGroupContaining?: string[];
}

/**
 * This data is sent to the main process to define the custom context menu that
 * should be built/shown.
 */
export interface ContextMenuShownData {
  /** Random UUID of the context menu instance. */
  id: string;

  /**
   * X and Y location of the mouse cursor (used to specify where the menu should
   * be shown).
   */
  position: Point;

  /**
   * If the target element clicked was an anchor element, this is the associated `href`
   * attribute. See {@link ContextMenu#show} for more details.
   */
  linkURL: string;

  /**
   * Array of objects that describe how to build the context menu. See
   * {@link https://www.electronjs.org/docs/latest/api/menu-item|MenuItem} for
   * additional details.
   */
  template: MenuItemConstructorOptions[];
}

/**
 * This is the data sent from the main to the renderer process when a context
 * menu item is clicked.
 */
export interface ContextMenuItemClickedData {
  /**
   * Entry from {@link ContextMenuShownData#template} that was clicked in the context
   * menu.
   */
  menuItemTemplate: MenuItemConstructorOptions;

  /**
   * Electron {@link https://www.electronjs.org/docs/latest/api/structures/keyboard-event|KeyboardEvent}
   * containing details about which modifier keys were pressed.
   */
  event: KeyboardEvent;
}

/**
 * Interface for defining a context or application menu. Some menu items don't have an
 * associated click event or an ID, but we want all menu items to adhere
 * to the same interface so we can track click handlers and access the template
 * to send to the main process (for context menus) to build the menu.
 */
export interface MenuItemOf<T extends MenuType> {
  get id(): string;
  get click(): OnMenuItemClick<T> | undefined;
  get template(): MenuItemConstructorOptions;
}

export type ContextMenuItem = MenuItemOf<"context">;

export type ApplicationMenuItem = MenuItemOf<"application">;

export enum IpcChannel {
  ForContextMenuShown = "hoverboard/contextMenu/shown",
  ForContextMenuHidden = "hoverboard/contextMenu/hidden",
  ForContextMenuItemClicked = "hoverboard/contextMenu/itemClicked",
}
