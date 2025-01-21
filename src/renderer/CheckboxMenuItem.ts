import {
  NormalMenuItem,
  type NormalMenuItemOptions,
} from "./NormalMenuItem.js";

/**
 * Options for creating a checkbox menu item.
 */
export interface CheckboxMenuItemOptions extends NormalMenuItemOptions {
  /** Indicates if checkbox is currently checked. */
  checked?: boolean | undefined;
}

/**
 * Returns a new {@linkcode CheckboxMenuItem} that can be added to a context
 * menu.
 *
 * @param options Options for creating the checkbox menu item.
 */
export function checkbox(options: CheckboxMenuItemOptions): CheckboxMenuItem {
  return new CheckboxMenuItem(options);
}

/**
 * Checkbox menu item in a context menu. This behaves similarly to a
 * {@linkcode NormalMenuItem} with the addition of a checked state. Multiple
 * items in the same submenu can be checked. If you need only one item checked
 * at a time, use the {@linkcode RadioMenuItem} instead.
 */
export class CheckboxMenuItem extends NormalMenuItem<CheckboxMenuItemOptions> {
  /** Indicates if checkbox is currently checked. */
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
