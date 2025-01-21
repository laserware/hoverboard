import type { MenuItemConstructorOptions } from "electron";

export type BooleanAttribute = "true" | "false" | null;

/**
 * Role for a {@linkcode RoleMenuItem}. See the [Electron documentation](https://www.electronjs.org/docs/latest/api/menu-item#roles)
 * for additional information.
 *
 * @remarks
 * Some of the menu item roles don't work in a context menu, so if clicking
 * on it doesn't do anything, that's why.
 */
export type ContextMenuItemRole = MenuItemConstructorOptions["role"];

/**
 * Type of context menu item. See the [Electron documentation](https://www.electronjs.org/docs/latest/api/menu-item#menuitemtype)
 * for additional information.
 */
export type ContextMenuItemType = MenuItemConstructorOptions["type"];
