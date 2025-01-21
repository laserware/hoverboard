import type { MenuItemConstructorOptions, SharingItem } from "electron";

import { ContextMenuItemElement } from "./ContextMenuItemElement.js";
import { SharingItemEntryElement } from "./SharingItemEntryElement.js";

export class ShareMenuElement extends ContextMenuItemElement {
  constructor() {
    super(undefined);
  }

  public toTemplate(): MenuItemConstructorOptions {
    const filePaths: string[] = [];
    const texts: string[] = [];
    const urls: string[] = [];

    for (let index = 0; index < this.children.length; index++) {
      const child = this.children.item(index);

      if (!(child instanceof SharingItemEntryElement)) {
        throw new Error("Only sharing item entry is allowed in share menu");
      }

      const { type, value } = child.entry;

      if (type === "filePath") {
        filePaths.push(value);
      } else if (type === "text") {
        texts.push(value);
      } else if (type === "url") {
        urls.push(value);
      }
    }
    const sharingItem: SharingItem = {};

    if (filePaths.length !== 0) {
      sharingItem.filePaths = filePaths;
    }

    if (texts.length !== 0) {
      sharingItem.texts = texts;
    }

    if (urls.length !== 0) {
      sharingItem.urls = urls;
    }

    return {
      ...super.toTemplate(),
      role: "shareMenu",
      sharingItem,
    };
  }
}
