import type { MenuItemConstructorOptions } from "electron";

import { getHoverboardGlobals } from "../../sandbox/globals.js";
import type { BooleanAttribute } from "../types.js";
import {
  ContextMenuEvent,
  type ContextMenuEventInit,
  type ContextMenuEventListenerOrEventListenerObject,
} from "./ContextMenuEvent.js";
import { ContextMenuItemElement, property } from "./ContextMenuItemElement.js";
import { SharingItemEntryElement } from "./SharingItemEntryElement.js";
import { SubmenuMenuItemElement } from "./SubmenuMenuItemElement.js";

export interface ContextMenuAttributes {
  anchor: string | null;
  detached: BooleanAttribute;
  id: string | null;
}

export class ContextMenuElement extends HTMLElement {
  #controllers: Map<HTMLElement | string, AbortController> = new Map();

  constructor() {
    super();

    this.style.display = "none";

    this.attachShadow({ mode: "closed" });
  }

  *[Symbol.iterator]() {
    for (let index = 0; index < this.children.length; index++) {
      yield this.children.item(index);
    }
  }

  @property({ type: String })
  public anchor: string | undefined;

  @property({ type: Boolean })
  public detached: boolean | undefined;

  @property({ type: String })
  public id!: string;

  public connectedCallback(): void {
    this.setAttribute("inert", "");

    if (this.getAttribute("id") === null) {
      this.id = window.crypto.randomUUID().substring(0, 6);
    }

    if (!this.detached) {
      this.attach(this.anchor);
    }
  }

  public disconnectedCallback(): void {
    void this.hide();

    if (!this.detached) {
      this.detach();
    }
  }

  public getAttribute(name: keyof ContextMenuAttributes) {
    return super.getAttribute(name);
  }

  public toTemplate(): MenuItemConstructorOptions[] {
    const template: MenuItemConstructorOptions[] = [];

    const walker = document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT);

    let node = walker.firstChild();

    while (node !== null) {
      // These don't get added to the menu template, they're used within a
      // ShareMenu menu item to define sharing items:
      if (node instanceof SharingItemEntryElement) {
        node = walker.nextNode();

        continue;
      }

      if (node instanceof ContextMenuItemElement) {
        if (node.parentNode instanceof SubmenuMenuItemElement) {
          node = walker.nextNode();

          continue;
        } else {
          template.push(node.toTemplate());
        }
      }

      node = walker.nextNode();
    }

    return template;
  }

  public addEventListener(
    type: "click",
    listener: ContextMenuEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  public addEventListener(
    type: "hide",
    listener: ContextMenuEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  public addEventListener(
    type: "show",
    listener: ContextMenuEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
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
  ): void;
  public removeEventListener(
    type: "hide",
    listener: ContextMenuEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  public removeEventListener(
    type: "show",
    listener: ContextMenuEventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    super.removeEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  public async hide(): Promise<void> {
    const globals = getHoverboardGlobals();

    await globals.hideContextMenu(this.id);

    this.dispatchEvent(
      new ContextMenuEvent("hide", { menu: this, menuItem: null }),
    );
  }

  public async show(
    x: number,
    y: number,
  ): Promise<ContextMenuItemElement | null> {
    const template = this.toTemplate();

    const globals = getHoverboardGlobals();

    const dispatchHideEvent = (
      menuItem: ContextMenuItemElement | null,
      triggeredByAccelerator?: boolean,
    ): void => {
      this.dispatchEvent(
        new ContextMenuEvent("hide", {
          clientX: x,
          clientY: y,
          menu: this,
          menuItem,
          triggeredByAccelerator,
        }),
      );
    };

    let linkURL: string | undefined;

    // If any of the elements in the clicked point are an anchor with an
    // `href` property, send that to the context menu builder in the main
    // process so we can add the appropriate link actions to the menu:
    for (const element of document.elementsFromPoint(x, y)) {
      if (element instanceof HTMLAnchorElement) {
        linkURL = element.href || undefined;
      }

      if (linkURL !== undefined) {
        break;
      }
    }

    const promise = globals.showContextMenu({
      menuId: this.id,
      position: { x, y },
      template,
      linkURL,
    });

    this.dispatchEvent(
      new ContextMenuEvent("show", {
        clientX: x,
        clientY: y,
        menu: this,
        menuItem: null,
      }),
    );

    const response = await promise;

    if (response.menuId !== this.id) {
      return null;
    }

    const menuItem =
      response.menuItemId === null
        ? null
        : this.querySelector(`#${response.menuItemId}`);

    if (!(menuItem instanceof ContextMenuItemElement)) {
      dispatchHideEvent(null);

      return null;
    }

    const event = new ContextMenuEvent("click", {
      ...response.event,
      clientX: x,
      clientY: y,
      menu: this,
      menuItem,
    } satisfies ContextMenuEventInit);

    menuItem.dispatchEvent(event);

    this.dispatchEvent(event);

    dispatchHideEvent(menuItem, response.event.triggeredByAccelerator);

    return menuItem;
  }

  public attach(anchor: HTMLElement | string | undefined): void {
    const controller = new AbortController();

    const { signal } = controller;

    const handleContextMenu = async (event: MouseEvent): Promise<void> => {
      event.preventDefault();

      await this.show(event.clientX, event.clientY);
    };

    if (anchor instanceof HTMLElement) {
      anchor.addEventListener("contextmenu", handleContextMenu, { signal });

      this.#controllers.set(anchor, controller);
    } else if (anchor === undefined) {
      const parent = this.parentElement;

      if (parent instanceof HTMLElement) {
        parent.addEventListener("contextmenu", handleContextMenu, { signal });

        this.#controllers.set(parent, controller);
      } else {
        throw new Error("No parent found for context menu");
      }
    } else {
      window.addEventListener(
        "contextmenu",
        async (event: MouseEvent) => {
          const target = event.target as HTMLElement;

          if ("matches" in target && target.matches(anchor)) {
            event.preventDefault();

            event.stopPropagation();

            await this.show(event.clientX, event.clientY);
          }
        },
        { signal, capture: true },
      );

      this.#controllers.set(anchor, controller);
    }
  }

  public detach(): void {
    for (const controller of this.#controllers.values()) {
      controller.abort();
    }

    this.#controllers.clear();
  }
}
