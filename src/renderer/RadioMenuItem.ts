import {
  NormalMenuItem,
  type NormalMenuItemOptions,
} from "./NormalMenuItem.js";

export interface RadioMenuItemOptions extends NormalMenuItemOptions {
  checked?: boolean | undefined;
}

export function radio(options: RadioMenuItemOptions): RadioMenuItem {
  return new RadioMenuItem(options);
}

export class RadioMenuItem extends NormalMenuItem<RadioMenuItemOptions> {
  public checked: boolean | undefined;

  constructor(options: RadioMenuItemOptions) {
    super(options, "radio");

    this.checked = options.checked;
  }

  public select(): void {
    this.checked = true;

    if (this.parent !== undefined) {
      for (const item of this.parent) {
        if (item instanceof RadioMenuItem && item !== this) {
          item.checked = false;
        }
      }
    }
  }

  public toTemplate(): Electron.MenuItemConstructorOptions {
    const template = super.toTemplate();

    if (this.checked !== undefined) {
      template.checked = this.checked;
    }

    return template;
  }
}
