import type { ContextMenuItem } from "./ContextMenuItem.js";
import { MenuBuilder, type MenuBuilderFunction } from "./MenuBuilder.js";
import {
  NormalMenuItem,
  type NormalMenuItemOptions,
} from "./NormalMenuItem.js";

export type SubmenuMenuItemOptions = NormalMenuItemOptions;

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

export class SubmenuMenuItem extends NormalMenuItem<SubmenuMenuItemOptions> {
  readonly #items: Set<ContextMenuItem>;

  constructor(options: SubmenuMenuItemOptions, build: MenuBuilderFunction);
  constructor(options: SubmenuMenuItemOptions, items: ContextMenuItem[]);
  constructor(
    options: SubmenuMenuItemOptions,
    init: ContextMenuItem[] | MenuBuilderFunction,
  ) {
    super(options, "submenu");

    this.#items = Array.isArray(init)
      ? new Set(init)
      : init(new MenuBuilder()).items;
  }

  public get items(): Set<ContextMenuItem> {
    return this.#items;
  }

  public toTemplate(): Electron.MenuItemConstructorOptions {
    const template = super.toTemplate();

    const submenu: Electron.MenuItemConstructorOptions[] = [];

    for (const menuItem of this.items) {
      menuItem.parent = this;

      submenu.push(menuItem.toTemplate());
    }

    return { ...template, submenu };
  }
}
