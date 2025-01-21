import {
  BrowserWindow,
  Menu,
  app,
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

  /**
   * Context menu to display for any elements that don't have a context menu
   * already defined. If `true`, adds a default context menu with common clipboard
   * operations  and the ability to inspect elements. Alternatively, specify a
   * template to show.
   */
  fallback?: boolean | Electron.MenuItemConstructorOptions[];
};

/**
 * Configures context menus that can be created from the renderer process.
 *
 * @param options Options for building context menus.
 */
export function configureContextMenus(options: ContextMenuOptions): void {
  if (options.fallback !== undefined) {
    setFallbackMenu(options);
  }

  const contextMenus = new Map<string, ContextMenu>();

  const closeContextMenu = (menuId: string, window: BrowserWindow): void => {
    contextMenus.get(menuId)?.closePopup(window);
    contextMenus.delete(menuId);
  };

  const handleShowContextMenu = (
    event: Electron.IpcMainInvokeEvent,
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

      console.log(template);

      const contextMenu = new ContextMenu(menuId, template);

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

  const handleHideContextMenu = (
    event: Electron.IpcMainInvokeEvent,
    menuId: string,
  ) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    if (browserWindow === null) {
      return;
    }

    closeContextMenu(menuId, browserWindow);
  };

  ipcMain.handle(IpcChannel.ForShowContextMenu, handleShowContextMenu);
  ipcMain.handle(IpcChannel.ForHideContextMenu, handleHideContextMenu);

  app.addListener("before-quit", (event: Electron.Event) => {
    if (event.defaultPrevented) {
      return;
    }

    ipcMain.removeHandler(IpcChannel.ForShowContextMenu);
    ipcMain.removeHandler(IpcChannel.ForHideContextMenu);
  });
}

/**
 * Adds a fallback context menu to every element in the DOM that doesn't have
 * a custom context menu explicitly specified. The menu contains standard
 * clipboard operations and the ability to inspect elements (if specified).
 */
function setFallbackMenu(options: ContextMenuOptions): void {
  const controller = new AbortController();

  const handleBrowserWindowCreated = (
    event: Electron.Event,
    browserWindow: BrowserWindow,
  ): void => {
    const webContents = browserWindow.webContents;

    const handleWebContentsContextMenu = (
      event: Electron.Event,
      params: Electron.ContextMenuParams,
    ) => {
      const template: Electron.MenuItemConstructorOptions[] = [];

      if (Array.isArray(options.fallback)) {
        template.push(...options.fallback);
      } else {
        // TODO: We probably want to add more items here at some point and
        //       may need to tweak it based on the target element.
        template.push({ role: "cut" }, { role: "copy" }, { role: "paste" });

        if (options.inspectElement) {
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
      }

      const contextMenu = Menu.buildFromTemplate(template);

      contextMenu.popup({ window: browserWindow });
    };

    // Important Note! If you don't call `event.preventDefault` in the
    // `contextmenu` event for the target element in the renderer, the
    // default menu will be shown instead of the custom context menu, so
    // make sure you do that!
    webContents.addListener("context-menu", handleWebContentsContextMenu);

    controller.signal.addEventListener("abort", () => {
      webContents.removeListener("context-menu", handleWebContentsContextMenu);
    });
  };

  app.addListener("browser-window-created", handleBrowserWindowCreated);

  controller.signal.addEventListener("abort", () => {
    app.removeListener("browser-window-created", handleBrowserWindowCreated);
  });

  app.addListener("before-quit", (event: Electron.Event) => {
    if (event.defaultPrevented) {
      return;
    }

    controller.abort();
  });
}

class ContextMenu {
  #menu: Menu;

  public id = "";

  constructor(id: string, template: Electron.MenuItemConstructorOptions[]) {
    this.id = id;
    this.#menu = Menu.buildFromTemplate(template);
  }

  public popup(options?: Electron.PopupOptions): void {
    this.#menu.popup(options);
  }

  public closePopup(window?: BrowserWindow): void {
    this.#menu.closePopup(window);
  }
}

function getIconForMenuItem(
  menuItem: Electron.MenuItemConstructorOptions,
): Electron.NativeImage | undefined {
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
  template: Electron.MenuItemConstructorOptions[],
): Generator<Electron.MenuItemConstructorOptions, void, void> {
  function* recurse(
    items: Electron.MenuItemConstructorOptions[],
  ): Generator<Electron.MenuItemConstructorOptions, void, void> {
    for (const item of items) {
      yield item;

      if (Array.isArray(item.submenu)) {
        yield* recurse(item.submenu);
      }
    }
  }

  yield* recurse(template);
}
