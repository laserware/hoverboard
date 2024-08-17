import { Menu, type MenuItemConstructorOptions } from "electron";

import {
  CheckboxMenuItem,
  type CheckboxMenuItemOptions,
} from "../common/CheckboxMenuItem.ts";
import {
  NormalMenuItem,
  type NormalMenuItemOptions,
} from "../common/NormalMenuItem.ts";
import {
  RadioMenuItem,
  type RadioMenuItemOptions,
} from "../common/RadioMenuItem.ts";
import {
  RoleMenuItem,
  type RoleMenuItemOptions,
} from "../common/RoleMenuItem.ts";
import {
  SeparatorMenuItem,
  type SeparatorMenuItemOptions,
} from "../common/SeparatorMenuItem.ts";
import {
  MenuBuilder,
  SubmenuMenuItem,
  type BuilderFunction,
  type SubmenuMenuItemOptions,
} from "../common/SubmenuMenuItem.ts";
import type { MenuItemOf } from "../common/types.ts";

/**
 * Provides the means to create a custom application menu.
 *
 * @public
 */
export class ApplicationMenu extends EventTarget {
  readonly #builder: MenuBuilder<"application">;

  #menu: Menu | null = null;
  #template: MenuItemConstructorOptions[] = [];

  /**
   * Returns a new main menu to the using the specified builder function.
   *
   * @param builder Builder function used to add items to the main menu.
   */
  public static create(
    builder: BuilderFunction<"application">,
  ): ApplicationMenu {
    return new ApplicationMenu(builder);
  }

  constructor(builder: BuilderFunction<"application">) {
    super();

    this.#builder = builder(new MenuBuilder());

    if (this.#builder === undefined) {
      // prettier-ignore
      throw new Error("Menu could not be created. This may be caused by not returning the builder from the MainMenu.create callback");
    }
  }

  /** Returns a new checkbox menu item with the specified options. */
  public static checkbox(
    options: CheckboxMenuItemOptions<"application">,
  ): CheckboxMenuItem<"application"> {
    return new CheckboxMenuItem(options);
  }

  /** Returns a new normal menu item with the specified options. */
  public static normal(
    options: NormalMenuItemOptions<"application">,
  ): NormalMenuItem<"application"> {
    return new NormalMenuItem(options);
  }

  /** Returns a new radio menu item with the specified options. */
  public static radio(
    options: RadioMenuItemOptions<"application">,
  ): RadioMenuItem<"application"> {
    return new RadioMenuItem(options);
  }

  /** Returns a new role menu item with the specified options. */
  public static role(
    options: RoleMenuItemOptions,
  ): RoleMenuItem<"application"> {
    return new RoleMenuItem(options);
  }

  /** Returns a new separator menu item with the specified options. */
  public static separator(
    options?: SeparatorMenuItemOptions,
  ): SeparatorMenuItem<"application"> {
    return new SeparatorMenuItem(options);
  }

  /** Returns a new submenu menu item with the specified options. */
  public static submenu(
    options: SubmenuMenuItemOptions<"application">,
    build: BuilderFunction<"application">,
  ): SubmenuMenuItem<"application"> {
    return new SubmenuMenuItem(options, build);
  }

  /** Menu items in the main menu. */
  public get items(): Set<MenuItemOf<"application">> {
    return this.#builder.items;
  }

  /**
   * Returns the Electron Menu instance (if the menu has been built).
   */
  public get electronMenu(): Menu {
    if (this.#menu === null) {
      throw new Error("Menu has not been built");
    }

    return this.#menu;
  }

  /** Object representation of the menu. Useful for testing/verification. */
  public get template(): MenuItemConstructorOptions[] {
    return this.#template;
  }

  /** Adds the specified menu item to the main menu. */
  public add(menuItem: MenuItemOf<"application">): this {
    this.items.add(menuItem);

    return this;
  }

  /**
   * Builds the menu template from the context menu items created in the
   * constructor builder function.
   */
  public build(): this {
    const menuItemIds = new Set<string>();

    this.#template = [];

    // Recurse through all the menu items and ensure there are not menu items
    // with duplicate IDs in the menu:
    const walkMenuItems = (menuItems: Set<MenuItemOf<"application">>): void => {
      for (const menuItem of menuItems.values()) {
        // Some menu items don't require an ID, such as a separator, so we set that
        // to an empty string in the menu item class. If we don't skip those, it's
        // highly likely that we'll get an error here:
        if (menuItem.id !== "" && menuItemIds.has(menuItem.id)) {
          throw new Error(`Duplicate ID ${menuItem.id} found in ${menuItem}`);
        } else {
          menuItemIds.add(menuItem.id);
        }

        this.#template.push(menuItem.template);

        if (menuItem instanceof SubmenuMenuItem) {
          walkMenuItems(menuItem.items);
        }
      }
    };

    walkMenuItems(this.items);

    this.#menu = Menu.buildFromTemplate(this.#template);

    return this;
  }

  public set(): this {
    if (this.#menu === null) {
      // prettier-ignore
      throw new Error("You must call build on the ApplicationMenu before setting")
    }

    Menu.setApplicationMenu(this.#menu);

    return this;
  }
}
