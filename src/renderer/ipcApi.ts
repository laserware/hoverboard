import type { IpcRendererEvent } from "electron";

/* istanbul ignore file -- @preserve: This is just a wrapper around IPC APIs, so no coverage required. */

/**
 * Optional override for the `ipcRenderer` API functions used to show the
 * context menu. Depending on whether context isolation is enabled, the
 * IPC renderer APIs may be accessible in different ways.
 *
 * Important note! Please read:
 * You _must_ define the full function for `addListener`/`removeListener`. You
 * cannot pass references from the `ipcRenderer` API directly because binding,
 * so this doesn't work:
 *
 * @example Wrong!
 * // DON'T DO THIS!
 * const { ipcRenderer } = require("electron");
 *
 * ContextMenu.create("Example", {
 *   addListener: ipcRenderer.addListener,
 *   removeListener: ipcRenderer.removeListener,
 *   send: ipcRenderer.send,
 * }, (builder) => {});
 *
 * Here is the correct way to do it (see {@link getDefaultIpcApi}):
 * @example Right!
 * // DO THIS INSTEAD!
 * const { ipcRenderer } = require("electron");
 *
 * return {
 *   addListener: (
 *     channel: string,
 *     listener: (event: IpcRendererEvent, ...args: any[]) => void,
 *   ): void => {
 *     ipcRenderer.addListener(channel, listener);
 *   },
 *   removeListener: (
 *     channel: string,
 *     listener: (event: IpcRendererEvent, ...args: any[]) => void,
 *   ): void => {
 *     ipcRenderer.removeListener(channel, listener);
 *   },
 *   send: (channel: string, ...args: any[]) => {
 *     ipcRenderer.send(channel, ...args);
 *   },
 * };
 */
export interface IpcApi {
  /** Override the default `addListener`/`on` function. */
  addListener(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void,
  ): void;

  /** Override the default `removeListener`/`off` function. */
  removeListener(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void,
  ): void;

  /** Override the default `send` function. */
  send(channel: string, ...args: any[]): void;
}

/**
 * Returns the default IPC API assuming we have contextIsolation disabled. Once
 * we add context isolation/sandboxing, we'll no longer be able to use
 * `require("electron")` in the renderer process, so we'll need to override this.
 */
export function getDefaultIpcApi(): IpcApi {
  const { ipcRenderer } = require("electron");

  return {
    addListener: (
      channel: string,
      listener: (event: IpcRendererEvent, ...args: any[]) => void,
    ): void => {
      ipcRenderer.addListener(channel, listener);
    },
    removeListener: (
      channel: string,
      listener: (event: IpcRendererEvent, ...args: any[]) => void,
    ): void => {
      ipcRenderer.removeListener(channel, listener);
    },
    send: (channel: string, ...args: any[]) => {
      ipcRenderer.send(channel, ...args);
    },
  };
}
