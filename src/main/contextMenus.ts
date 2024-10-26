import {
  app,
  BaseWindow,
  BrowserWindow,
  clipboard,
  ipcMain,
  Menu,
  nativeImage,
  shell,
  type ContextMenuParams,
  type Event as ElectronEvent,
  type IpcMainEvent,
  type KeyboardEvent,
  type MenuItem,
  type MenuItemConstructorOptions,
  type Point,
} from "electron";

import {
  IpcChannel,
  type ContextMenuItemClickedData,
  type ContextMenuShownData,
} from "../common/types.ts";

interface CustomMenuBuilderOptions {
  /**
   * Adds the "Inspect Element" menu item to the custom context menu, which
   * is very useful for development.
   */
  appendInspectElementToMenus: boolean;

  /**
   * Adds context menu items to copy and open links if the target element clicked
   * was an anchor tag.
   */
  appendLinkHandlersToMenus: boolean;
}

/**
 * We probably only want to show the "Inspect Element" menu item during development,
 * just like in the custom menu.
 */
type DefaultMenuBuilderOptions = Pick<
  CustomMenuBuilderOptions,
  "appendInspectElementToMenus"
>;

interface ConfigureContextMenusOptions extends CustomMenuBuilderOptions {
  /**
   * Add a default context menu with common clipboard operations and the
   * ability to inspect elements.
   */
  enableDefaultMenu: boolean;
}

/**
 * Adds a listener to build a custom context menu (see {@link enableCustomContextMenuBuilder})
 * and optionally a default context menu (see {@link enableDefaultContextMenuBuilder}) based
 * on the specified options.
 */
export function configureContextMenus(
  options: ConfigureContextMenusOptions,
): void {
  const {
    appendInspectElementToMenus,
    appendLinkHandlersToMenus,
    enableDefaultMenu,
  } = options;

  if (enableDefaultMenu) {
    enableDefaultContextMenuBuilder({ appendInspectElementToMenus });
  }

  enableCustomContextMenuBuilder({
    appendInspectElementToMenus,
    appendLinkHandlersToMenus,
  });
}

/**
 * Adds a fallback context menu to every element in the DOM that doesn't have
 * a custom context menu explicitly specified. The menu contains standard
 * clipboard operations and the ability to inspect elements (if specified).
 */
function enableDefaultContextMenuBuilder(
  options: DefaultMenuBuilderOptions,
): void {
  app.on(
    "browser-window-created",
    (event: ElectronEvent, browserWindow: BrowserWindow): void => {
      const webContents = browserWindow.webContents;

      // Important Note! If you don't call `event.preventDefault` in the
      // `contextmenu` event for the target element in the renderer, the
      // default menu will be shown instead of the custom context menu, so
      // make sure you do that!
      webContents.addListener(
        "context-menu",
        async (event: ElectronEvent, params: ContextMenuParams) => {
          // TODO: We probably want to add more items here at some point and
          //       may need to tweak it based on the target element.
          const template: MenuItemConstructorOptions[] = [
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
          ];

          if (options.appendInspectElementToMenus) {
            template.push(
              { type: "separator" },
              {
                label: "Inspect Element",
                click() {
                  webContents.inspectElement(params.x, params.y);
                },
              },
            );
          }

          const contextMenu = Menu.buildFromTemplate(template);

          contextMenu.popup({ window: browserWindow });
        },
      );
    },
  );
}

/**
 * Adds an IPC listener that creates a custom context menu whenever it receives
 * a request from the renderer process with a template. The listener builds the
 * menu, shows it, and sends a message back to the renderer with the clicked
 * item details. Also adds a listener that explicitly closes the context menu
 * when specified.
 */
function enableCustomContextMenuBuilder(
  options: CustomMenuBuilderOptions,
): void {
  const openContextMenusById = new Map<string, Menu>();

  ipcMain.on(
    IpcChannel.ForContextMenuShown,
    (event: IpcMainEvent, data: ContextMenuShownData): void => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      if (browserWindow === null) {
        return;
      }

      let { position, template } = data;

      position = getScaledCursorPosition(browserWindow, position);

      template = assignClickHandlersAndIcons(template, event);

      if (options?.appendLinkHandlersToMenus) {
        template = appendLinkHandlerMenuItems(template, data.linkURL);
      }

      if (options?.appendInspectElementToMenus) {
        // prettier-ignore
        template = appendInspectElementMenuItem(template, browserWindow, position);
      }

      const customContextMenu = Menu.buildFromTemplate(template);

      customContextMenu.popup({
        window: browserWindow,
        ...position,
        // Fired when the context menu is closed:
        callback() {
          openContextMenusById.delete(data.id);

          browserWindow.webContents.send(IpcChannel.ForContextMenuClosed);
        },
      });
    },
  );

  // Hide an open context menu if explicitly requested from the renderer process:
  ipcMain.on(
    IpcChannel.ForContextMenuHidden,
    (event: IpcMainEvent, id: string) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      if (browserWindow === null) {
        return;
      }

      const customContextMenu = openContextMenusById.get(id);
      if (customContextMenu !== undefined) {
        customContextMenu.closePopup(browserWindow);

        openContextMenusById.delete(id);
      }
    },
  );
}

/**
 * Adjusts the specified cursor position to accommodate for the current zoom
 * factor of the active browser window. If we didn't do this, and the zoom level
 * was not 100%, the context menu would not appear next to the clicked element.
 *
 * @param browserWindow Active browser window.
 * @param position Position of the mouse cursor.
 */
function getScaledCursorPosition(
  browserWindow: BrowserWindow,
  position: Point,
): Point {
  const zoomFactor = browserWindow.webContents.getZoomFactor();

  const x = Math.floor(position.x * zoomFactor);
  const y = Math.floor(position.y * zoomFactor);

  return { x, y };
}

/**
 * Loops through the specified menu items and adds click handlers for items that
 * are clickable (i.e. checkbox, normal, radio, and submenu menu items). Click
 * handlers are assigned to _every_ clickable menu item, even if a click event
 * wasn't specified in the renderer process. If an item is clicked that didn't
 * have a specific click handler, it's ignored. If an `icon` property was specified
 * for a menu item in the template, converts it to a `NativeImage` instance so
 * it is shown in the menu.
 *
 * @param menuItems Menu items to add click handlers and icons to.
 * @param ipcMainEvent Event from the IPC call (used to send a message with the clicked
 *                     menu item data back to the renderer process).
 */
function assignClickHandlersAndIcons(
  menuItems: MenuItemConstructorOptions[],
  ipcMainEvent: IpcMainEvent,
): MenuItemConstructorOptions[] {
  const updatedMenuItems: MenuItemConstructorOptions[] = [];

  for (const menuItem of menuItems) {
    let updatedMenuItem = assignIconToMenuItem(menuItem);

    if (menuItem.type === "separator" || "role" in menuItem) {
      updatedMenuItems.push(updatedMenuItem);
      continue;
    }

    updatedMenuItem = assignClickHandlerToMenuItem(menuItem, ipcMainEvent);

    if (menuItem.type === "submenu" && Array.isArray(updatedMenuItem.submenu)) {
      updatedMenuItem.submenu = assignClickHandlersAndIcons(
        updatedMenuItem.submenu,
        ipcMainEvent,
      );
    }

    updatedMenuItems.push(updatedMenuItem);
  }

  return updatedMenuItems;
}

/**
 * Adds a click handler to the specified menu item that sends a message to the
 * renderer process with the clicked menu item data.
 *
 * @param menuItemWithoutClick Menu item _without_ the `click` listener.
 * @param ipcMainEvent Event from the IPC call (used to send a message with the clicked
 *                     menu item data back to the renderer process).
 */
function assignClickHandlerToMenuItem(
  menuItemWithoutClick: MenuItemConstructorOptions,
  ipcMainEvent: IpcMainEvent,
): MenuItemConstructorOptions {
  const handleMenuItemClick = (
    menuItem: MenuItem,
    baseWindow: BaseWindow | undefined,
    event: KeyboardEvent,
  ): void => {
    // We send the menu item to the renderer _without_ the click listener because
    // the click listener cannot be serialized. If we didn't do this, Electron
    // would throw an error:
    const clickedData: ContextMenuItemClickedData = {
      menuItemTemplate: menuItemWithoutClick,
      event,
    };

    ipcMainEvent.sender.send(IpcChannel.ForContextMenuItemClicked, clickedData);
  };

  return { ...menuItemWithoutClick, click: handleMenuItemClick };
}

/**
 * If the menu item has an `icon` value specified, we swap it out with a
 * `NativeImage` so it's shown in the menu.
 *
 * @param menuItem Menu item to update.
 */
function assignIconToMenuItem(
  menuItem: MenuItemConstructorOptions,
): MenuItemConstructorOptions {
  if (typeof menuItem.icon !== "string") {
    return menuItem;
  }

  // Rather than try to determine if the icon property was a file path or a
  // data URL, we start by trying to create it from a path (since this is
  // probably the most likely scenario). If the value was a data URL, the
  // native image will be empty, so we try again:
  let image = nativeImage.createFromPath(menuItem.icon);

  if (image.isEmpty()) {
    image = nativeImage.createFromDataURL(menuItem.icon);
  }

  // We resize the image to make sure it fits in the menu:
  menuItem.icon = image.resize({ width: 16, height: 16, quality: "best" });

  return menuItem;
}

/**
 * Appends menu items to the specified menu items array that can copy or open
 * the link associated with the target element (if any). If the specified link
 * URL is an empty string, does nothing.
 *
 * @param menuItems Menu items to append link menu items to.
 * @param linkURL URL of the link associated with the target element (if any).
 */
function appendLinkHandlerMenuItems(
  menuItems: MenuItemConstructorOptions[],
  linkURL: string,
): MenuItemConstructorOptions[] {
  if (linkURL === "") {
    return menuItems;
  }

  return [
    ...menuItems,
    { type: "separator" },
    {
      label: "Copy Link",
      type: "normal",
      click: () => clipboard.writeText(linkURL, "clipboard"),
    },
    {
      label: "Open Link",
      type: "normal",
      click: () => shell.openExternal(linkURL),
    },
  ];
}

/**
 * Appends a menu item to the specified menu items that allows the user to
 * inspect the element that the context menu was attached to. The x and y
 * cursor position was updated to accommodate for the current window zoom factor.
 *
 * @param menuItems Menu items to append "Inspect Element" item to.
 * @param browserWindow Active browser window.
 * @param x Scaled X position of the mouse cursor.
 * @param y Scaled Y position of the mouse cursor.
 */
function appendInspectElementMenuItem(
  menuItems: MenuItemConstructorOptions[],
  browserWindow: BrowserWindow,
  { x, y }: Point,
): MenuItemConstructorOptions[] {
  return [
    ...menuItems,
    { type: "separator" },
    {
      label: "Inspect Element",
      type: "normal",
      click: () => {
        browserWindow.webContents?.inspectElement(x, y);
      },
    },
  ];
}
