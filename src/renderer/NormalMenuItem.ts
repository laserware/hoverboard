import type { MenuItemConstructorOptions } from "electron";

import {
  ContextMenuItem,
  type ContextMenuItemOptions,
  type OnContextMenuItemClick,
} from "./ContextMenuItem.js";
import type { ContextMenuItemType } from "./types.js";

export interface NormalMenuItemOptions extends ContextMenuItemOptions {
  accelerator?: string | undefined;
  acceleratorWorksWhenHidden?: boolean | undefined;
  enabled?: boolean | undefined;
  icon?: string | undefined;
  label: string | undefined;
  registerAccelerator?: boolean | undefined;
  toolTip?: string | undefined;
  click?: OnContextMenuItemClick;
}

export function normal(options: NormalMenuItemOptions): NormalMenuItem {
  return new NormalMenuItem(options);
}

export class NormalMenuItem<
  Options extends NormalMenuItemOptions = NormalMenuItemOptions,
> extends ContextMenuItem {
  constructor(options: Options, type: ContextMenuItemType = "normal") {
    super(options, type);

    this.accelerator = options.accelerator;
    this.acceleratorWorksWhenHidden = options.acceleratorWorksWhenHidden;
    this.click = options.click;
    this.enabled = options.enabled;
    this.icon = options.icon;
    this.label = options.label;
    this.registerAccelerator = options.registerAccelerator;
    this.toolTip = options.toolTip;
  }

  public accelerator: string | undefined;
  public acceleratorWorksWhenHidden: boolean | undefined;
  public click: OnContextMenuItemClick | undefined;
  public enabled: boolean | undefined;
  public icon: string | undefined;
  public label: string | undefined;
  public registerAccelerator: boolean | undefined;
  public toolTip: string | undefined;

  public toTemplate(): MenuItemConstructorOptions {
    const template = super.toTemplate();

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

    if (this.label !== undefined) {
      template.label = this.label;
    }

    if (this.registerAccelerator !== undefined) {
      template.registerAccelerator = this.registerAccelerator;
    }

    if (this.toolTip !== undefined) {
      template.toolTip = this.toolTip;
    }

    return template;
  }
}
