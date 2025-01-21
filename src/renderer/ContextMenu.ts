import type { MenuItemConstructorOptions } from "electron";

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
 */
export class ContextMenu extends EventTarget {
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

    this.items = Array.isArray(init) ? init : init(new MenuBuilder()).items;
  }

  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }

  public id: string;
  public items: ContextMenuItem[];

  /**
   * Appends the specified `item` to the context menu.
   *
   * @param item Menu item to append to context menu.
   */
  public append(item: ContextMenuItem): void {
    this.items.push(item);
  }

  /**
   * Inserts the specified `item` in the specified position of the context
   * menu.
   *
   * @param position Position in the menu to add the item.
   * @param item Item to insert into the context menu.
   */
  public insert(position: number, item: ContextMenuItem): void {
    this.items = [
      ...this.items.slice(0, position),
      item,
      ...this.items.slice(position),
    ];
  }

  /**
   * Removes the specified `item` from the context menu.
   *
   * @param item Menu item to remove from context menu.
   */
  public remove(item: ContextMenuItem): void {
    this.items = this.items.filter((existingItem) => existingItem !== item);
  }

  /**
   * Returns the menu item associated with the specified `id`. If the menu
   * item doesn't exist, returns null.
   *
   * @param id ID of the menu item to find.
   *
   * @returns The menu item if found, otherwise null.
   */
  public getMenuItemById(id: string): ContextMenuItem | null {
    for (const item of walkContextMenu(this)) {
      if (item.id === id) {
        return item;
      }
    }

    return null;
  }

  /**
   * Converts the contents of the context menu item to a serializable template
   * that is sent to the main process to build the context menu.
   */
  public toTemplate(): MenuItemConstructorOptions[] {
    const template: MenuItemConstructorOptions[] = [];

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
   * is dispatched immediately before the menu is shown.
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
  public async hide(): Promise<void> {
    const globals = getHoverboardGlobals();

    await globals.hideContextMenu(this.id);

    this.dispatchEvent(new ContextMenuEvent("hide", { menuItem: null }));
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

    const dispatchHideEvent = (
      menuItem: ContextMenuItem | null,
      triggeredByAccelerator?: boolean,
    ): void => {
      this.dispatchEvent(
        new ContextMenuEvent("hide", {
          clientX: x,
          clientY: y,
          menuItem,
          triggeredByAccelerator,
        }),
      );
    };

    let linkURL: string | undefined;

    // If any of the elements in the clicked point are an anchor with an
    // `href` property, send that to the context menu builder in the main
    // process so we can add the appropriate link actions to the menu:
    for (const element of document.elementsFromPoint(x, y)) {
      if (element instanceof HTMLAnchorElement) {
        linkURL = element.href || undefined;
      }

      if (linkURL !== undefined) {
        break;
      }
    }

    const promise = globals.showContextMenu({
      menuId: this.id,
      position: { x, y },
      template,
      linkURL,
    });

    this.dispatchEvent(
      new ContextMenuEvent("show", {
        clientX: x,
        clientY: y,
        menuItem: null,
      } satisfies ContextMenuEventInit),
    );

    const response = await promise;

    if (response.menuId !== this.id) {
      return null;
    }

    if (response.menuItemId === null) {
      dispatchHideEvent(null);

      return null;
    }

    let menuItem: ContextMenuItem | null = null;

    for (const item of walkContextMenu(this)) {
      if (item.id === response.menuItemId) {
        menuItem = item;
        break;
      }
    }

    if (menuItem === null) {
      dispatchHideEvent(null);

      return null;
    }

    if (menuItem instanceof NormalMenuItem && menuItem.click !== undefined) {
      const event = new ContextMenuEvent("click", {
        ...response.event,
        clientX: x,
        clientY: y,
        menuItem,
      } satisfies ContextMenuEventInit);

      menuItem.click(menuItem, event);

      this.dispatchEvent(event);
    }

    dispatchHideEvent(menuItem, response.event.triggeredByAccelerator);

    return menuItem;
  }
}

function* walkContextMenu(
  menu: ContextMenu,
): Generator<ContextMenuItem, void, void> {
  function* recurse(
    items: ContextMenuItem[],
  ): Generator<ContextMenuItem, void, void> {
    for (const item of items) {
      yield item;

      if (item instanceof SubmenuMenuItem) {
        yield* recurse(item.items);
      }
    }
  }

  yield* recurse(menu.items);
}
