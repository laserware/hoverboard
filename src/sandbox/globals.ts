import type {
  KeyboardEvent,
  MenuItemConstructorOptions,
  Point,
} from "electron";

export const hoverboardApiKey = "__laserware_hoverboard__";

declare global {
  interface Window {
    [hoverboardApiKey]: HoverboardGlobals;
  }
}

// biome-ignore lint/suspicious/noConstEnum: Swapped out with value in build process.
export const enum IpcChannel {
  ForShowContextMenu = "hoverboard/contextMenu/show",
  ForHideContextMenu = "hoverboard/contextMenu/hide",
}

export interface ShowContextMenuRequest {
  menuId: string;
  position: Point;
  linkURL?: string;
  template: MenuItemConstructorOptions[];
}

export interface ShowContextMenuResponse {
  menuId: string;
  menuItemId: string | null;
  event: KeyboardEvent;
}

export interface HoverboardGlobals {
  showContextMenu(
    request: ShowContextMenuRequest,
  ): Promise<ShowContextMenuResponse>;
  hideContextMenu(menuId: string): Promise<void>;
}

export function getHoverboardGlobals(): HoverboardGlobals {
  const windowGlobals = window[hoverboardApiKey];

  if (windowGlobals === undefined) {
    throw new Error("Globals not found, need to use preload");
  }

  return {
    showContextMenu(
      request: ShowContextMenuRequest,
    ): Promise<ShowContextMenuResponse> {
      return windowGlobals.showContextMenu(request);
    },
    hideContextMenu(menuId: string): Promise<void> {
      return windowGlobals.hideContextMenu(menuId);
    },
  };
}
