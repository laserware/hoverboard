import type { MenuItemConstructorOptions } from "electron";

import {
  ContextMenuItem,
  type ContextMenuItemOptions,
} from "./ContextMenuItem.js";

export type SeparatorMenuItemOptions = ContextMenuItemOptions;

export function separator(
  options?: SeparatorMenuItemOptions,
): SeparatorMenuItem {
  return new SeparatorMenuItem(options);
}

export class SeparatorMenuItem extends ContextMenuItem {
  constructor(options?: SeparatorMenuItemOptions) {
    super(options, "separator");
  }

  public toTemplate(): MenuItemConstructorOptions {
    return super.toTemplate();
  }
}
