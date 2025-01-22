import type { MenuItemConstructorOptions } from "electron";

import { getHoverboardGlobals } from "../sandbox/globals.js";
import {
  ContextMenuEvent,
  type ContextMenuEventInit,
  type ContextMenuEventListenerOrEventListenerObject,
} from "./ContextMenuEvent.js";
import { ContextMenuItemElement, property } from "./ContextMenuItemElement.js";
import { SharingItemEntryElement } from "./SharingItemEntryElement.js";
import { SubmenuMenuItemElement } from "./SubmenuMenuItemElement.js";

export interface ContextMenuAttributes {
  target: string | null;
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
  public target: string | undefined;

  @property({ type: String })
  public id!: string;

  public connectedCallback(): void {
    this.setAttribute("inert", "");

    if (this.getAttribute("id") === null) {
      this.id = window.crypto.randomUUID().substring(0, 6);
    }

    if (this.target === undefined) {
      throw new Error("The target attribute is required for a context menu");
    } else {
      this.attach(this.target);
    }
  }

  public disconnectedCallback(): void {
    this.dispose();
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

    // biome-ignore format:
    this.dispatchEvent(new ContextMenuEvent("hide", { menu: this, menuItem: null }));
  }

  public async show(
    x: number,
    y: number,
  ): Promise<ContextMenuItemElement | null> {
    const template = this.toTemplate();

    const globals = getHoverboardGlobals();

    let trigger: HTMLElement | null = null;

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
          trigger,
          triggeredByAccelerator,
        }),
      );
    };

    let linkURL: string | undefined;

    // If any of the elements in the clicked point are an anchor with an
    // `href` property, send that to the context menu builder in the main
    // process so we can add the appropriate link actions to the menu:
    for (const element of document.elementsFromPoint(x, y)) {
      if (
        this.target !== undefined &&
        element.matches(this.target) &&
        trigger === null
      ) {
        trigger = element as HTMLElement;
      }

      if (element instanceof HTMLAnchorElement && linkURL === undefined) {
        linkURL = element.href || undefined;
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
        trigger,
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
      trigger,
    } satisfies ContextMenuEventInit);

    menuItem.dispatchEvent(event);

    this.dispatchEvent(event);

    dispatchHideEvent(menuItem, response.event.triggeredByAccelerator);

    return menuItem;
  }

  public attach(target: HTMLElement | string): void {
    const controller = new AbortController();

    const { signal } = controller;

    if (target instanceof HTMLElement) {
      target.addEventListener(
        "contextmenu",
        async (event: MouseEvent): Promise<void> => {
          event.preventDefault();

          await this.show(event.clientX, event.clientY);
        },
        { signal, capture: true },
      );

      this.#controllers.set(target, controller);
    } else {
      window.addEventListener(
        "contextmenu",
        async (event: MouseEvent) => {
          const element = event.target as HTMLElement;

          if (element.matches(target) || element.closest(target) !== null) {
            event.preventDefault();

            event.stopPropagation();

            await this.show(event.clientX, event.clientY);
          }
        },
        { signal, capture: true },
      );

      this.#controllers.set(target, controller);
    }
  }

  public detach(): void {
    for (const controller of this.#controllers.values()) {
      controller.abort();
    }

    this.#controllers.clear();
  }

  public dispose(): void {
    this.detach();
  }
}
