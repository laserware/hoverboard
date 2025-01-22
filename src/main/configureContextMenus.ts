import {
  BrowserWindow,
  type IpcMainInvokeEvent,
  Menu,
  type MenuItemConstructorOptions,
  type NativeImage,
  clipboard,
  ipcMain,
  nativeImage,
  shell,
} from "electron";

import {
  IpcChannel,
  type ShowContextMenuRequest,
  type ShowContextMenuResponse,
} from "../sandbox/globals.js";

/**
 * Options for configuring context menus in the application.
 */
export type ContextMenuOptions = {
  /**
   * Adds the "Inspect Element" menu item to the custom context menu, which
   * is very useful for development.
   */
  inspectElement?: boolean;

  /**
   * Adds context menu items to copy and open links if the target element clicked
   * was an anchor tag.
   */
  linkHandlers?: boolean;
};

/**
 * Electron Menu instance with an ID that enables us to find the menu and
 * dispose of it.
 *
 * @internal
 */
interface CustomContextMenu extends Menu {
  id: string;
}

function createCustomContextMenu(
  id: string,
  template: MenuItemConstructorOptions[],
): CustomContextMenu {
  const contextMenu = Menu.buildFromTemplate(template);

  return Object.assign(contextMenu, { id });
}

/**
 * Configures context menus that can be created from the renderer process.
 *
 * @param options Options for building context menus.
 */
export function configureContextMenus(options: ContextMenuOptions): {
  dispose(): void;
} {
  const contextMenus = new Map<string, CustomContextMenu>();

  const closeContextMenu = (menuId: string, window: BrowserWindow): void => {
    contextMenus.get(menuId)?.closePopup(window);
    contextMenus.delete(menuId);
  };

  const handleShowContextMenu = (
    event: IpcMainInvokeEvent,
    request: ShowContextMenuRequest,
  ) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    if (browserWindow === null) {
      return;
    }

    const { menuId, position, template, linkURL } = request;

    return new Promise((resolve) => {
      closeContextMenu(menuId, browserWindow);

      for (const item of walkMenuTemplate(template)) {
        item.icon = getIconForMenuItem(item);

        if (item.type !== "separator" && item.role === undefined) {
          item.click = (menuItem, window, event) => {
            if (item.id === undefined) {
              throw new Error("Clickable item must have an ID");
            }

            resolve({
              menuId,
              menuItemId: item.id,
              event,
            } satisfies ShowContextMenuResponse);
          };
        }
      }

      const zoomFactor = browserWindow.webContents.getZoomFactor();

      const x = Math.floor(position.x * zoomFactor);
      const y = Math.floor(position.y * zoomFactor);

      if (linkURL !== undefined) {
        template.push(
          { type: "separator" },
          {
            label: "Copy Link",
            type: "normal",
            click: () => {
              void clipboard.writeText(linkURL, "clipboard");
            },
          },
          {
            label: "Open Link",
            type: "normal",
            click: () => {
              void shell.openExternal(linkURL);
            },
          },
        );
      }

      if (options.inspectElement) {
        template.push(
          { type: "separator" },
          {
            label: "Inspect Element",
            type: "normal",
            click: () => {
              browserWindow.webContents?.inspectElement(x, y);
            },
          },
        );
      }

      const contextMenu = createCustomContextMenu(menuId, template);

      contextMenus.set(menuId, contextMenu);

      contextMenu.popup({
        window: browserWindow,
        x,
        y,
        callback() {
          contextMenus.delete(menuId);

          resolve({
            menuId,
            menuItemId: null,
            event: {},
          } satisfies ShowContextMenuResponse);
        },
      });
    });
  };

  const handleHideContextMenu = (event: IpcMainInvokeEvent, menuId: string) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    if (browserWindow === null) {
      return;
    }

    closeContextMenu(menuId, browserWindow);
  };

  ipcMain.handle(IpcChannel.ForShowContextMenu, handleShowContextMenu);
  ipcMain.handle(IpcChannel.ForHideContextMenu, handleHideContextMenu);

  return {
    dispose(): void {
      ipcMain.removeHandler(IpcChannel.ForShowContextMenu);
      ipcMain.removeHandler(IpcChannel.ForHideContextMenu);
    },
  };
}

function getIconForMenuItem(
  menuItem: MenuItemConstructorOptions,
): NativeImage | undefined {
  if (typeof menuItem.icon !== "string") {
    return undefined;
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
  return image.resize({ width: 16, height: 16, quality: "best" });
}

function* walkMenuTemplate(
  template: MenuItemConstructorOptions[],
): Generator<MenuItemConstructorOptions, void, void> {
  function* recurse(
    items: MenuItemConstructorOptions[],
  ): Generator<MenuItemConstructorOptions, void, void> {
    for (const item of items) {
      yield item;

      if (Array.isArray(item.submenu)) {
        yield* recurse(item.submenu);
      }
    }
  }

  yield* recurse(template);
}
