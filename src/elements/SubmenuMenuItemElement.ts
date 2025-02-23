import type { MenuItemConstructorOptions } from "electron";

import { ContextMenuItemElement } from "./ContextMenuItemElement.js";
import {
  type NormalMenuItemAttributes,
  NormalMenuItemElement,
} from "./NormalMenuItemElement.js";
import { SharingItemEntryElement } from "./SharingItemEntryElement.js";

export type SubmenuMenuItemAttributes = NormalMenuItemAttributes;

export class SubmenuMenuItemElement extends NormalMenuItemElement<SubmenuMenuItemAttributes> {
  constructor() {
    super("submenu");
  }

  [Symbol.iterator]() {
    let index = 0;

    return {
      next: () => {
        if (index < this.children.length) {
          return { value: this.children.item(index++), done: false };
        } else {
          return { done: true };
        }
      },
    };
  }

  public toTemplate(): MenuItemConstructorOptions {
    const template = super.toTemplate();

    const walker = document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT);

    let node = walker.firstChild();

    const submenu: MenuItemConstructorOptions[] = [];

    while (node !== null) {
      // These don't get added to the menu template, they're used within a
      // ShareMenu menu item to define sharing items:
      if (node instanceof SharingItemEntryElement) {
        node = walker.nextNode();

        continue;
      }

      if (node instanceof ContextMenuItemElement) {
        node.submenu = this;

        submenu.push(node.toTemplate());
      }

      node = walker.nextNode();
    }

    return { ...template, submenu };
  }
}
