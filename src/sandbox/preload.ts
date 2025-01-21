import { contextBridge, ipcRenderer } from "electron";

import {
  type HoverboardGlobals,
  IpcChannel,
  type ShowContextMenuRequest,
  type ShowContextMenuResponse,
  hoverboardApiKey,
} from "./globals.js";

function preloadHoverboard(): void {
  const globals: HoverboardGlobals = {
    showContextMenu(
      request: ShowContextMenuRequest,
    ): Promise<ShowContextMenuResponse> {
      return ipcRenderer.invoke(IpcChannel.ForShowContextMenu, request);
    },
    hideContextMenu(id: string): Promise<void> {
      return ipcRenderer.invoke(IpcChannel.ForHideContextMenu, id);
    },
  };

  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld(hoverboardApiKey, globals);
  } else {
    window[hoverboardApiKey] = globals;
  }
}

preloadHoverboard();
