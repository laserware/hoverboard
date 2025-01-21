import type { MenuItemConstructorOptions } from "electron";

import type { BooleanAttribute, ContextMenuItemType } from "../types.js";
import type { ContextMenuElement } from "./ContextMenuElement.js";
import type { SubmenuMenuItemElement } from "./SubmenuMenuItemElement.js";

export interface ContextMenuItemAttributes {
  id: string;
  visible: BooleanAttribute;
}

export type PropertyOptions = {
  attribute?: string;
  type: typeof Boolean | typeof Number | typeof String;
  fallback?: boolean | number | string;
};

export function property(options: PropertyOptions) {
  // biome-ignore lint/complexity/useArrowFunction: Need to use a function here.
  return function (target: HTMLElement, propertyKey: string) {
    const attributeName = options.attribute ?? propertyKey;

    Object.defineProperty(target, propertyKey, {
      get() {
        const value = this.getAttribute(attributeName);

        if (value === null) {
          return options.fallback ?? undefined;
        }

        switch (options.type) {
          case Boolean:
            return value === "true";

          case Number: {
            const numericValue = Number(value);

            if (
              Number.isNaN(numericValue) &&
              typeof options.fallback === "number"
            ) {
              return options.fallback;
            } else {
              return numericValue;
            }
          }

          default:
            return value;
        }
      },

      set(value: boolean | number | string | null | undefined) {
        if (value === null || value === undefined) {
          this.removeAttribute(attributeName);
        } else {
          this.setAttribute(attributeName, String(value));
        }
      },
    });
  };
}

const idGenerator = (() => {
  let value = 1;

  return {
    next: () => `menu-item-${(value++).toString()}`,
  };
})();

export class ContextMenuItemElement<
  Attrs extends Record<string, any> = ContextMenuItemAttributes,
> extends HTMLElement {
  public readonly type: ContextMenuItemType;

  constructor(type: ContextMenuItemType) {
    super();

    this.type = type;
  }

  @property({ type: String })
  public id!: string;

  @property({ type: Boolean })
  public visible: boolean | undefined;

  public toTemplate(): MenuItemConstructorOptions {
    const template: MenuItemConstructorOptions = {};

    const id = this.getAttribute("id");

    if (id !== null) {
      template.id = this.id;
    }

    if (this.type !== undefined) {
      template.type = this.type;
    }

    if (this.visible !== undefined) {
      template.visible = this.visible;
    }

    return template;
  }

  public connectedCallback(): void {
    const id = this.getAttribute("id");

    if (id === null) {
      this.setAttribute("id", idGenerator.next());
    }
  }

  public getAttribute(name: keyof Attrs) {
    return super.getAttribute(name as string);
  }

  public setAttribute(name: keyof Attrs, value: string) {
    super.setAttribute(name as string, value);
  }

  public removeAttribute(name: keyof Attrs) {
    super.removeAttribute(name as string);
  }
}
