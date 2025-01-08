// noinspection JSUnusedGlobalSymbols

import { TypedEventTarget, uuid } from "@laserware/arcade";
import type {
  IpcRendererEvent,
  KeyboardEvent,
  MenuItemConstructorOptions,
} from "electron";

import {
  CheckboxMenuItem,
  type CheckboxMenuItemOptions,
} from "../common/CheckboxMenuItem.js";
import {
  NormalMenuItem,
  type NormalMenuItemOptions,
} from "../common/NormalMenuItem.js";
import {
  RadioMenuItem,
  type RadioMenuItemOptions,
} from "../common/RadioMenuItem.js";
import {
  RoleMenuItem,
  type RoleMenuItemOptions,
} from "../common/RoleMenuItem.js";
import {
  SeparatorMenuItem,
  type SeparatorMenuItemOptions,
} from "../common/SeparatorMenuItem.js";
import {
  type BuilderFunction,
  MenuBuilder,
  SubmenuMenuItem,
  type SubmenuMenuItemOptions,
} from "../common/SubmenuMenuItem.js";
import {
  type ContextMenuItem,
  type ContextMenuItemClickedData,
  type ContextMenuShownData,
  IpcChannel,
  type OnContextMenuItemClick,
} from "../common/types.js";

import { type IpcApi, getDefaultIpcApi } from "./ipcApi.js";

type ContextMenuEventMap = {
  /**
   * Fired when a context menu item is clicked. You can use this as an alternative
   * (or in addition to) `click` events assigned to individual context menu
   * items.
   */
  click: CustomEvent<{ menuItem: ContextMenuItem; event: KeyboardEvent }>;
  open: Event;
  close: Event;
};

/**
 * Provides the means to create and show custom context menus.
 *
 * @public
 */
export class ContextMenu extends TypedEventTarget<ContextMenuEventMap> {
  readonly #builder: MenuBuilder<"context">;
  /**
   * Store references to click events that are fired when the context menu item
   * is clicked. We store these here because they cannot be serialized and
   * send to the main process.
   */
  readonly #clickHandlers: Map<string, OnContextMenuItemClick | undefined>;
  /**
   * Name of the menu, which is assigned to the dataset of the target element
   * in the DOM.
   */
  readonly #name: string;

  /**
   * Temporary random ID assigned to the context menu so we can refer to it in
   * the main process.
   */
  readonly #id: string;

  #element: HTMLElement | null = null;
  #ipcApi: IpcApi | null = null;
  #template: MenuItemConstructorOptions[] = [];

  /**
   * Returns a new context menu with the specified name, IPC overrides,
   * and builder function.
   *
   * @param name Name of the context menu.
   * @param ipcApi IPC API overrides. See {@link IpcApi} for more details.
   * @param builder Builder function used to add items to the context menu.
   */
  public static create(
    name: string,
    ipcApi: IpcApi,
    builder: BuilderFunction<"context">,
  ): ContextMenu {
    return new ContextMenu(name, ipcApi, builder);
  }

  /**
   * Creates a new instance of a `ContextMenu`. You should use the
   * {@link ContextMenu#create} method for creating the menu instead of calling
   * the constructor directly.
   *
   * @param name Name of the context menu.
   * @param builderOrIpcApi Builder function to add items to the context menu or
   *                        the IPC API overrides. If you specify IPC API overrides,
   *                        you _must_ specify a builder function as the third
   *                        argument.
   * @param [builder] Builder function used to add items to the context menu. This
   *                  must be specified if a custom IPC API is specified.
   */
  constructor(
    name: string,
    builderOrIpcApi: BuilderFunction<"context"> | IpcApi,
    builder?: BuilderFunction<"context">,
  ) {
    super();

    this.#clickHandlers = new Map();
    this.#name = name;
    this.#id = uuid();

    if (typeof builderOrIpcApi === "function") {
      this.#builder = builderOrIpcApi(new MenuBuilder());
    } else {
      this.#ipcApi = builderOrIpcApi;

      if (builder === undefined) {
        // biome-ignore format:
        throw new Error("A builder function is required to create a context menu");
      } else {
        this.#builder = builder(new MenuBuilder());
      }
    }

    if (this.#builder === undefined) {
      // biome-ignore format:
      throw new Error("Menu could not be created. This may be caused by not returning the builder from the ContextMenu.create callback");
    }
  }

  /** Returns a new checkbox menu item with the specified options. */
  public static checkbox(
    options: CheckboxMenuItemOptions<"context">,
  ): CheckboxMenuItem<"context"> {
    return new CheckboxMenuItem(options);
  }

  /** Returns a new normal menu item with the specified options. */
  public static normal(
    options: NormalMenuItemOptions<"context">,
  ): NormalMenuItem<"context"> {
    return new NormalMenuItem(options);
  }

  /** Returns a new radio menu item with the specified options. */
  public static radio(
    options: RadioMenuItemOptions<"context">,
  ): RadioMenuItem<"context"> {
    return new RadioMenuItem(options);
  }

  /** Returns a new role menu item with the specified options. */
  public static role(options: RoleMenuItemOptions): RoleMenuItem<"context"> {
    return new RoleMenuItem(options);
  }

  /** Returns a new separator menu item with the specified options. */
  public static separator(
    options?: SeparatorMenuItemOptions,
  ): SeparatorMenuItem<"context"> {
    return new SeparatorMenuItem(options);
  }

  /** Returns a new submenu menu item with the specified options. */
  public static submenu(
    options: SubmenuMenuItemOptions<"context">,
    build: BuilderFunction<"context">,
  ): SubmenuMenuItem<"context"> {
    return new SubmenuMenuItem(options, build);
  }

  /** Menu items in the context menu. */
  public get items(): Set<ContextMenuItem> {
    return this.#builder.items;
  }

  /** Object representation of the menu. Useful for testing/verification. */
  public get template(): MenuItemConstructorOptions[] {
    return this.#template;
  }

  /**
   * Sets the IPC API to use for the communication between the main and
   * renderer process. We expose this as a settable property in case you don't
   * want to override the IPC API in the {@link ContextMenu#create} method.
   */
  public withIpcApi(ipcApi: IpcApi): this {
    this.#ipcApi = ipcApi;
    return this;
  }

  /** Adds the specified menu item to the context menu. */
  public add(menuItem: ContextMenuItem): this {
    this.items.add(menuItem);

    return this;
  }

  /**
   * Builds the menu template from the context menu items created in the
   * constructor builder function.
   */
  public build(): this {
    this.#clickHandlers.clear();

    const menuItemIds = new Set<string>();

    // Recurse through all the menu items, save click handlers by ID, and ensure
    // there are not menu items with duplicate IDs in the menu:
    const walkMenuItems = (menuItems: Set<ContextMenuItem>): void => {
      for (const menuItem of menuItems.values()) {
        // Some menu items don't require an ID, such as a separator, so we set that
        // to an empty string in the menu item class. If we don't skip those, it's
        // highly likely that we'll get an error here:
        if (menuItem.id !== "" && menuItemIds.has(menuItem.id)) {
          throw new Error(`Duplicate ID ${menuItem.id} found in ${menuItem}`);
        } else {
          menuItemIds.add(menuItem.id);
        }

        this.#clickHandlers.set(menuItem.id, menuItem.click);

        if (menuItem instanceof SubmenuMenuItem) {
          walkMenuItems(menuItem.items);
        }
      }
    };

    walkMenuItems(this.items);

    this.#template = [];
    for (const menuItem of this.items.values()) {
      this.#template.push(menuItem.template);
    }

    return this;
  }

  /**
   * Attaches the context menu to the specified element. This doesn't actually
   * "attach" to anything in the traditional sense, but it adds a data
   * attribute indicating the element is the target for the context menu.
   *
   * @param element Element to attach context menu to.
   */
  public attach(element: HTMLElement): this {
    this.dispose();

    this.#element = element;
    this.#element.setAttribute("data-context-menu-name", this.#name);

    return this;
  }

  /**
   * Removes the menu name data attribute from the attached element.
   */
  public dispose(): this {
    this.#element?.removeAttribute("data-context-menu-name");
    this.#element = null;

    return this;
  }

  /**
   * Shows the menu in the specified x and y position. The optional link URL
   * represents the `href` attribute from the target element (if the clicked
   * element was a link).
   *
   * @param x X location to show the context menu.
   * @param y Y location to show the context menu.
   * @param [linkURL] Link URL associated with the target element (if any). If the target element
   *                  clicked was an anchor element, this is the associated `href` attribute.
   *                  We're passing this into the menu so we can add custom handling for links
   *                  (if needed). For example, we may want to open a link in the users browser,
   *                  rather than in another Electron window, or provide the ability to copy the URL.
   */
  public show(x: number, y: number, linkURL = ""): this {
    if (this.#ipcApi === null) {
      this.#ipcApi = getDefaultIpcApi();
    }

    this.dispatchEvent(new Event("open"));

    this.#ipcApi.addListener(
      IpcChannel.ForContextMenuClosed,
      this.#handleClosed,
    );

    this.#ipcApi.addListener(
      IpcChannel.ForContextMenuItemClicked,
      this.#handleMenuItemClicked,
    );

    const data: ContextMenuShownData = {
      id: this.#id,
      position: { x, y },
      template: this.#template,
      linkURL,
    };

    this.#ipcApi.send(IpcChannel.ForContextMenuShown, data);

    return this;
  }

  /**
   * Explicitly hides the context menu. We may need to do this in response
   * to actions like the window losing focus/minimized, or a keyboard shortcut
   * causing a change to the UI that would result in an invalid state.
   */
  public hide(): this {
    if (this.#ipcApi === null) {
      this.#ipcApi = getDefaultIpcApi();
    }

    this.#ipcApi.send(IpcChannel.ForContextMenuHidden, this.#id);

    return this;
  }

  #handleClosed = (): void => {
    this.dispatchEvent(new Event("close"));

    this.#ipcApi?.removeListener(
      IpcChannel.ForContextMenuClosed,
      this.#handleClosed,
    );
  };

  /* istanbul ignore next -- @preserve: This cannot be tested with Vitest (only E2E). */
  #handleMenuItemClicked = (
    ipcRendererEvent: IpcRendererEvent,
    clickedMenuItemData: ContextMenuItemClickedData,
  ): void => {
    const { menuItemTemplate, event } = clickedMenuItemData;

    if (this.#ipcApi === null) {
      this.#ipcApi = getDefaultIpcApi();
    }

    if (menuItemTemplate.id === undefined) {
      throw new Error("Clicked menu item doesn't have ID");
    }

    const clickHandler = this.#clickHandlers.get(menuItemTemplate.id);
    clickHandler?.(menuItemTemplate, event);

    // Dispatch the `click` event for the context menu, except use the menu
    // item for the payload, rather than just the template because the menu
    // item data is accessible from within the `click` property of each menu
    // item:
    for (const menuItem of this.items.values()) {
      if (menuItem.id === menuItemTemplate.id) {
        const detail = { menuItem, event };

        this.dispatchEvent(new CustomEvent("click", { detail }));
      }
    }

    this.#ipcApi.removeListener(
      IpcChannel.ForContextMenuItemClicked,
      this.#handleMenuItemClicked,
    );
  };
}
