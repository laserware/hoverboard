import type { MenuItemConstructorOptions } from "electron";

import {
  ContextMenuItem,
  type ContextMenuItemOptions,
  type ContextMenuItemRole,
} from "./ContextMenuItem.js";

export interface RoleMenuItemOptions extends ContextMenuItemOptions {
  accelerator?: string | undefined;
  acceleratorWorksWhenHidden?: boolean | undefined;
  enabled?: boolean | undefined;
  icon?: string | undefined;
  role: ContextMenuItemRole;
  registerAccelerator?: boolean | undefined;
  tooltip?: string | undefined;
}

export function role(role: ContextMenuItemRole): RoleMenuItem;

export function role(options: RoleMenuItemOptions): RoleMenuItem;

export function role(
  init: ContextMenuItemRole | RoleMenuItemOptions,
): RoleMenuItem {
  return new RoleMenuItem(init as any);
}

export class RoleMenuItem extends ContextMenuItem {
  public accelerator: string | undefined;
  public acceleratorWorksWhenHidden: boolean | undefined;
  public enabled: boolean | undefined;
  public icon: string | undefined;
  public registerAccelerator: boolean | undefined;
  public role: ContextMenuItemRole;
  public tooltip: string | undefined;

  constructor(role: ContextMenuItemRole);
  constructor(options: RoleMenuItemOptions);
  constructor(init: ContextMenuItemRole | RoleMenuItemOptions) {
    super(typeof init === "string" ? { role: init } : init, undefined);

    if (typeof init === "string") {
      this.role = init;
    } else {
      const options = (init ?? {}) as RoleMenuItemOptions;

      if (options.role === undefined) {
        throw new Error("Role is required for a role menu item");
      }

      this.accelerator = options.accelerator;
      this.acceleratorWorksWhenHidden = options.acceleratorWorksWhenHidden;
      this.enabled = options.enabled;
      this.icon = options.icon;
      this.registerAccelerator = options.registerAccelerator;
      this.role = options.role;
      this.tooltip = options.tooltip;
    }
  }

  public toTemplate(): MenuItemConstructorOptions {
    const template = super.toTemplate();

    template.role = this.role;

    if (this.accelerator !== undefined) {
      template.accelerator = this.accelerator;
    }

    if (this.acceleratorWorksWhenHidden !== undefined) {
      template.acceleratorWorksWhenHidden = this.acceleratorWorksWhenHidden;
    }

    if (this.enabled !== undefined) {
      template.enabled = this.enabled;
    }

    if (this.icon !== undefined) {
      template.icon = this.icon;
    }

    if (this.registerAccelerator !== undefined) {
      template.registerAccelerator = this.registerAccelerator;
    }

    if (this.tooltip !== undefined) {
      template.toolTip = this.tooltip;
    }

    return template;
  }
}
