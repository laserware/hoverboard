import type { MenuItemConstructorOptions } from "electron";
import type { BooleanAttribute, ContextMenuItemRole } from "../types.js";
import {
  type ContextMenuItemAttributes,
  ContextMenuItemElement,
  property,
} from "./ContextMenuItemElement.js";

export interface RoleMenuItemAttributes extends ContextMenuItemAttributes {
  accelerator: string | null;
  "accelerator-works-when-hidden": BooleanAttribute;
  enabled: BooleanAttribute;
  icon: string | null;
  of: ContextMenuItemRole | null;
  "register-accelerator": BooleanAttribute;
  tooltip: string | null;
}

export class RoleMenuItemElement extends ContextMenuItemElement<RoleMenuItemAttributes> {
  constructor() {
    super(undefined);
  }

  @property({ type: String })
  public accelerator: string | undefined;

  @property({ attribute: "accelerator-works-when-hidden", type: Boolean })
  public acceleratorWorksWhenHidden: boolean | undefined;

  @property({ type: Boolean })
  public enabled: boolean | undefined;

  @property({ type: String })
  public icon: string | undefined;

  @property({ type: String })
  public of: ContextMenuItemRole | undefined;

  @property({ attribute: "register-accelerator", type: Boolean })
  public registerAccelerator: boolean | undefined;

  @property({ attribute: "tooltip", type: String })
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

    if (this.of !== undefined) {
      template.role = this.of;
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
