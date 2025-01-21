import type { MenuItemConstructorOptions } from "electron";

import {
  type BooleanAttribute,
  type ContextMenuItemAttributes,
  property,
} from "./ContextMenuItemElement.js";
import { NormalMenuItemElement } from "./NormalMenuItemElement.js";

export interface CheckboxMenuItemAttributes extends ContextMenuItemAttributes {
  checked: BooleanAttribute;
}

export class CheckboxMenuItemElement extends NormalMenuItemElement<CheckboxMenuItemAttributes> {
  constructor() {
    super("checkbox");
  }

  @property({ type: Boolean })
  public checked: boolean | undefined;

  public toTemplate(): MenuItemConstructorOptions {
    const template = super.toTemplate();

    if (this.checked !== undefined) {
      template.checked = this.checked;
    }

    return template;
  }
}
