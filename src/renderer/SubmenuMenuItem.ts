import type { MenuItemConstructorOptions } from "electron";

import {
  ContextMenuItem,
  type ContextMenuItemOptions,
} from "./ContextMenuItem.js";
import { MenuBuilder, type MenuBuilderFunction } from "./MenuBuilder.js";

export interface SubmenuMenuItemOptions extends ContextMenuItemOptions {
  enabled?: boolean | undefined;
  icon?: string | undefined;
  label: string | undefined;
  toolTip?: string | undefined;
}

export function submenu(
  options: SubmenuMenuItemOptions,
  items: ContextMenuItem[],
): SubmenuMenuItem;

export function submenu(
  options: SubmenuMenuItemOptions,
  build: MenuBuilderFunction,
): SubmenuMenuItem;

export function submenu(
  options: SubmenuMenuItemOptions,
  init: ContextMenuItem[] | MenuBuilderFunction,
): SubmenuMenuItem {
  return new SubmenuMenuItem(options, init as any);
}

export class SubmenuMenuItem extends ContextMenuItem {
  constructor(options: SubmenuMenuItemOptions, build: MenuBuilderFunction);
  constructor(options: SubmenuMenuItemOptions, items: ContextMenuItem[]);
  constructor(
    options: SubmenuMenuItemOptions,
    init: ContextMenuItem[] | MenuBuilderFunction,
  ) {
    super(options, "submenu");

    this.enabled = options.enabled;
    this.icon = options.icon;
    this.items = Array.isArray(init) ? init : init(new MenuBuilder()).items;
    this.label = options.label;
    this.toolTip = options.toolTip;
  }

  public enabled: boolean | undefined;
  public icon: string | undefined;
  public items: ContextMenuItem[];
  public label: string | undefined;
  public toolTip: string | undefined;

  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }

  public toTemplate(): MenuItemConstructorOptions {
    const template = super.toTemplate();

    if (this.enabled !== undefined) {
      template.enabled = this.enabled;
    }

    if (this.icon !== undefined) {
      template.icon = this.icon;
    }

    if (this.label !== undefined) {
      template.label = this.label;
    }

    if (this.toolTip !== undefined) {
      template.toolTip = this.toolTip;
    }

    const submenu: MenuItemConstructorOptions[] = [];

    for (const item of this.items) {
      item.parent = this;

      submenu.push(item.toTemplate());
    }

    return { ...template, submenu };
  }
}
