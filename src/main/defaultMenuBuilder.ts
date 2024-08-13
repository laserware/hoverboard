import {
  app,
  Menu,
  type BrowserWindow,
  type ContextMenuParams,
  type Event as ElectronEvent,
  type MenuItemConstructorOptions,
} from "electron";

import type { CustomMenuBuilderOptions } from "./customMenuBuilder.ts";

/**
 * We probably only want to show the "Inspect Element" menu item during development,
 * just like in the custom menu.
 */
export type DefaultMenuBuilderOptions = Pick<
  CustomMenuBuilderOptions,
  "appendInspectElementToMenus"
>;

/**
 * Adds a fallback context menu to every element in the DOM that doesn't have
 * a custom context menu explicitly specified. The menu contains standard
 * clipboard operations and the ability to inspect elements (if specified).
 */
export function enableDefaultMenuBuilder(
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
