import {
  NormalMenuItem,
  type NormalMenuItemOptions,
} from "./NormalMenuItem.js";

export interface CheckboxMenuItemOptions extends NormalMenuItemOptions {
  checked?: boolean | undefined;
}

export function checkbox(options: CheckboxMenuItemOptions): CheckboxMenuItem {
  return new CheckboxMenuItem(options);
}

export class CheckboxMenuItem extends NormalMenuItem<CheckboxMenuItemOptions> {
  public checked: boolean | undefined;

  constructor(options: CheckboxMenuItemOptions) {
    super(options, "checkbox");

    this.checked = options.checked;
  }

  public toTemplate(): Electron.MenuItemConstructorOptions {
    const template = super.toTemplate();

    if (this.checked !== undefined) {
      template.checked = this.checked;
    }

    return template;
  }
}
