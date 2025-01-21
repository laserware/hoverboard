import { getHoverboardGlobals } from "../sandbox/globals.js";
import {
  ContextMenuEvent,
  type ContextMenuEventInit,
  type ContextMenuEventListenerOrEventListenerObject,
  type ContextMenuEventType,
} from "./ContextMenuEvent.js";
import type { ContextMenuItem } from "./ContextMenuItem.js";
import { MenuBuilder, type MenuBuilderFunction } from "./MenuBuilder.js";
import { NormalMenuItem } from "./NormalMenuItem.js";
import { SubmenuMenuItem } from "./SubmenuMenuItem.js";

/**
 * Creates a new context menu with the specified `items`.
 *
 * @param items Context menu items to add to context menu.
 *
 * @returns Context menu with specified items.
 */
export function contextMenu(items: ContextMenuItem[]): ContextMenu;

/**
 * Builds a new context menu using the specified `build` function.
 *
 * @param build Function with menu builder to assign items to menu.
 *
 * @returns Context menu with items added from build function.
 */
export function contextMenu(build: MenuBuilderFunction): ContextMenu;

export function contextMenu(
  init: ContextMenuItem[] | MenuBuilderFunction,
): ContextMenu {
  return new ContextMenu(init as any);
}

/**
 * Provides the means to create and show custom context menus.
 *
 * @public
 */
export class ContextMenu extends EventTarget {
  readonly #items: Set<ContextMenuItem>;

  public id: string;

  /**
   * Creates a new context menu with the specified `items`.
   *
   * @param items Context menu items to add to context menu.
   */
  constructor(items: ContextMenuItem[]);

  /**
   * Builds a new context menu using the specified `build` function.
   *
   * @param build Function with menu builder to assign items to menu.
   */
  constructor(build: MenuBuilderFunction);
  constructor(init: ContextMenuItem[] | MenuBuilderFunction) {
    super();

    this.id = window.crypto.randomUUID().substring(0, 6);
    this.#items = Array.isArray(init)
      ? new Set(init)
      : init(new MenuBuilder()).items;
  }

  *[Symbol.iterator]() {
    function* recurse(
      items: Set<ContextMenuItem>,
    ): Generator<ContextMenuItem, void, void> {
      for (const item of items) {
        yield item;

        if (item instanceof SubmenuMenuItem) {
          yield* recurse(item.items);
        }
      }
    }

    yield* recurse(this.items);
  }

  /**
   * Unique items in the context menu.
   *
   * @readonly
   */
  public get items(): Set<ContextMenuItem> {
    return this.#items;
  }

  /**
   * Converts the contents of the context menu item to a serializable template
   * that is sent to the main process to build the context menu.
   */
  public toTemplate(): Electron.MenuItemConstructorOptions[] {
    const template: Electron.MenuItemConstructorOptions[] = [];

    for (const item of this.items) {
      template.push(item.toTemplate());
    }

    return template;
  }

  /**
   * Adds an event listener for the click event of a context menu item. This
   * event is fired when any context menu item is clicked. This is dispatched
   * *after* the `click` property of a menu item.
   */
  public addEventListener(
    type: "click",
    callback: ContextMenuEventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;

  /**
   * Adds an event listener for the hide event of a context menu. This event
   * is dispatched immediately after the menu is hidden.
   */
  public addEventListener(
    type: "hide",
    callback: ContextMenuEventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;

  /**
   * Adds an event listener for the show event of a context menu. This event
   * is dispatched immediately after the menu is shown.
   */
  public addEventListener(
    type: "show",
    callback: ContextMenuEventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
  public addEventListener(
    type: ContextMenuEventType,
    callback: ContextMenuEventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    // biome-ignore format:
    super.addEventListener(type, callback as EventListenerOrEventListenerObject, options);
  }

  public removeEventListener(
    type: "click",
    callback: ContextMenuEventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
  public removeEventListener(
    type: "hide",
    callback: ContextMenuEventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
  public removeEventListener(
    type: "show",
    callback: ContextMenuEventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
  public removeEventListener(
    type: ContextMenuEventType,
    callback: ContextMenuEventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    // biome-ignore format:
    super.removeEventListener(type, callback as EventListenerOrEventListenerObject, options);
  }

  /**
   * Hides the context menu (if it is open).
   */
  public hide(): void {
    const globals = getHoverboardGlobals();

    globals.hideContextMenu(this.id).then(() => {
      this.dispatchEvent(new ContextMenuEvent("hide"));
    });
  }

  /**
   * Shows the context menu in the specified `x` and `y` coordinates.
   *
   * @param x X location to display the context menu.
   * @param y Y location to display the context menu.
   *
   * @returns Promise resolving with the menu item that was clicked. If no menu
   *          item was clicked, resolves to `null`.
   */
  public async show(x: number, y: number): Promise<ContextMenuItem | null> {
    const template = this.toTemplate();

    const globals = getHoverboardGlobals();

    const response = await globals.showContextMenu({
      menuId: this.id,
      position: { x, y },
      template,
    });

    console.log(response.menuItemId);

    if (response.menuId !== this.id) {
      return null;
    }

    this.dispatchEvent(
      new ContextMenuEvent("show", {
        ...response.event,
        clientX: x,
        clientY: y,
      } satisfies ContextMenuEventInit),
    );

    if (response.menuItemId === null) {
      return null;
    }

    let menuItem: ContextMenuItem | null = null;

    for (const item of this) {
      if (item.id === response.menuItemId) {
        menuItem = item;
        break;
      }
    }

    if (menuItem === null) {
      return null;
    }

    if (menuItem instanceof NormalMenuItem && menuItem.click !== undefined) {
      const event = new ContextMenuEvent("click", {
        ...response.event,
        clientX: x,
        clientY: y,
      } satisfies ContextMenuEventInit);

      menuItem.click(menuItem, event);

      this.dispatchEvent(event);

      return menuItem;
    }

    return null;
  }
}
