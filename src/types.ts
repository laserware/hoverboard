import type {
  KeyboardEvent,
  MenuItemConstructorOptions,
  Point,
} from "electron";

/**
 * This data is sent to the main process to define the custom context menu that
 * should be built/shown.
 */
export interface ContextMenuShownData {
  /** Random UUID of the context menu instance. */
  id: string;

  /**
   * X and Y location of the mouse cursor (used to specify where the menu should
   * be shown.
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
 * This is the click event fired in the _renderer_ process when a context menu
 * item is clicked. It has a different signature than the `click` event from the
 * `MenuItemConstructorOptions`.
 */
export type OnContextMenuItemClick = (
  menuItem: MenuItemConstructorOptions,
  event: KeyboardEvent,
) => void;

/**
 * Interface for defining a context menu. Some context menu items don't have an
 * associated click event or an ID, but we want all context menu items to adhere
 * to the same interface so we can track click handlers and access the template
 * to send to the main process to build the menu.
 */
export interface ContextMenuItem {
  get id(): string;
  get click(): OnContextMenuItemClick | undefined;
  get template(): MenuItemConstructorOptions;
}

export enum IpcChannel {
  ForContextMenuShown = "contextMenu/shown",
  ForContextMenuHidden = "contextMenu/hidden",
  ForContextMenuItemClicked = "contextMenu/itemClicked",
}
