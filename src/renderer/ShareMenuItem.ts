import type { MenuItemConstructorOptions, SharingItem } from "electron";

import {
  ContextMenuItem,
  type ContextMenuItemOptions,
} from "./ContextMenuItem.js";

/**
 * Options for creating a Share menu item.
 */
export interface ShareMenuItemOptions extends ContextMenuItemOptions {
  /** Array of file paths to share. */
  filePaths?: string[];

  /** Array of text values to share. */
  texts?: string[];

  /** Array of URLs to share. */
  urls?: string[];
}

/**
 * Creates a new Share menu for sharing items on macOS.
 *
 * @param options Options for the share menu item.
 */
export function shareMenu(options: ShareMenuItemOptions): ShareMenuItem {
  return new ShareMenuItem(options);
}

/**
 * Share menu for sharing items on macOS.
 */
export class ShareMenuItem extends ContextMenuItem {
  public filePaths: string[] | undefined;
  public texts: string[] | undefined;
  public urls: string[] | undefined;

  constructor(options: ShareMenuItemOptions) {
    super(options, undefined);

    this.filePaths = options.filePaths;
    this.texts = options.texts;
    this.urls = options.urls;
  }

  public toTemplate(): MenuItemConstructorOptions {
    this.validate();

    const template = super.toTemplate();

    const sharingItem: SharingItem = {};

    if (this.filePaths !== undefined) {
      sharingItem.filePaths = this.filePaths;
    }

    if (this.texts !== undefined) {
      sharingItem.texts = this.texts;
    }

    if (this.urls !== undefined) {
      sharingItem.urls = this.urls;
    }

    template.role = "shareMenu";

    template.sharingItem = sharingItem;

    return template;
  }

  /**
   * Ensures the share menu has at least 1 sharing item.
   *
   * @throws Error If nothing is being shared.
   */
  public validate(): void {
    for (const entry of [this.filePaths, this.texts, this.urls]) {
      if ((entry ?? []).length !== 0) {
        return;
      }
    }

    // biome-ignore format:
    throw new Error("A share menu must have at least 1 file path, text, or URL");
  }
}
