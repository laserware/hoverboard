import type { ContextMenuElement } from "./ContextMenuElement.js";
import type { ContextMenuItemElement } from "./ContextMenuItemElement.js";

export type ContextMenuEventType = "attach" | "click" | "hide" | "show";

export interface ContextMenuEventInit extends EventModifierInit {
  clientX?: number;
  clientY?: number;
  triggeredByAccelerator?: boolean;
  menu: ContextMenuElement | null;
  menuItem: ContextMenuItemElement | null;
  trigger?: HTMLElement | null;
}

type ContextMenuEventListener = (event: ContextMenuEvent) => void;

interface ContextMenuEventListenerObject {
  handleEvent(object: ContextMenuEvent): void;
}

export type ContextMenuEventListenerOrEventListenerObject =
  | ContextMenuEventListener
  | ContextMenuEventListenerObject;

export class ContextMenuEvent extends Event {
  public trigger: HTMLElement | null;
  public triggeredByAccelerator: boolean;
  public clientX: number;
  public clientY: number;
  public menu: ContextMenuElement | null;
  public menuItem: ContextMenuItemElement | null;

  constructor(type: ContextMenuEventType, eventInitDict: ContextMenuEventInit) {
    const {
      trigger,
      clientX,
      clientY,
      menu,
      menuItem,
      triggeredByAccelerator,
      ...rest
    } = eventInitDict;

    super(type, { bubbles: false, cancelable: true, composed: true, ...rest });

    this.clientX = clientX ?? 0;
    this.clientY = clientY ?? 0;
    this.menuItem = menuItem;
    this.menu = menu;
    this.trigger = trigger ?? null;
    this.triggeredByAccelerator = triggeredByAccelerator ?? false;
  }
}
