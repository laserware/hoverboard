import type { MenuItemConstructorOptions } from "electron";

import type { BooleanAttribute } from "../types.js";
import {
  type ContextMenuItemAttributes,
  property,
} from "./ContextMenuItemElement.js";
import { NormalMenuItemElement } from "./NormalMenuItemElement.js";

export interface RadioMenuItemAttributes extends ContextMenuItemAttributes {
  checked: BooleanAttribute;
}

export class RadioMenuItemElement extends NormalMenuItemElement<RadioMenuItemAttributes> {
  constructor() {
    super("radio");
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
