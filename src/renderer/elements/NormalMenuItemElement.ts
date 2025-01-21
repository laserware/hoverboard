import type { MenuItemConstructorOptions } from "electron";

import type { BooleanAttribute, ContextMenuItemType } from "../types.js";
import type { ContextMenuEventListenerOrEventListenerObject } from "./ContextMenuEvent.js";
import {
  type ContextMenuItemAttributes,
  ContextMenuItemElement,
  property,
} from "./ContextMenuItemElement.js";

export interface NormalMenuItemAttributes extends ContextMenuItemAttributes {
  accelerator: string | null;
  "accelerator-works-when-hidden": BooleanAttribute;
  enabled: BooleanAttribute;
  icon: string | null;
  label: string | null;
  "register-accelerator": BooleanAttribute;
  tooltip: string | null;
}

export class NormalMenuItemElement<
  A extends Record<string, any> = NormalMenuItemAttributes,
> extends ContextMenuItemElement<A> {
  constructor(type: ContextMenuItemType = "normal") {
    super(type);
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
  public label: string | undefined;

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

  public addEventListener(
    type: "click",
    listener: ContextMenuEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  public removeEventListener(
    type: "click",
    listener: ContextMenuEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.removeEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }
}
