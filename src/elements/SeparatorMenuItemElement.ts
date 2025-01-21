import type { MenuItemConstructorOptions } from "electron";

import {
  type ContextMenuItemAttributes,
  ContextMenuItemElement,
} from "./ContextMenuItemElement.js";

export type SeparatorMenuItemAttributes = ContextMenuItemAttributes;

export class SeparatorMenuItemElement extends ContextMenuItemElement<SeparatorMenuItemAttributes> {
  constructor() {
    super("separator");
  }

  public get template(): MenuItemConstructorOptions {
    const { visible, type } = super.toTemplate();

    const template: MenuItemConstructorOptions = { type };

    if (visible !== undefined) {
      template.visible = visible;
    }

    return template;
  }
}
