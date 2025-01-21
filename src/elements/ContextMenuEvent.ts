import type { ContextMenuElement } from "./ContextMenuElement.js";
import type { ContextMenuItemElement } from "./ContextMenuItemElement.js";

export type ContextMenuEventType = "click" | "hide" | "show";

export interface ContextMenuEventInit extends EventModifierInit {
  clientX?: number;
  clientY?: number;
  triggeredByAccelerator?: boolean;
  menu: ContextMenuElement | null;
  menuItem: ContextMenuItemElement | null;
}

type ContextMenuEventListener = (event: ContextMenuEvent) => void;

interface ContextMenuEventListenerObject {
  handleEvent(object: ContextMenuEvent): void;
}

export type ContextMenuEventListenerOrEventListenerObject =
  | ContextMenuEventListener
  | ContextMenuEventListenerObject;

export class ContextMenuEvent extends Event {
  public triggeredByAccelerator: boolean;
  public clientX: number;
  public clientY: number;
  public menu: ContextMenuElement | null;
  public menuItem: ContextMenuItemElement | null;

  constructor(type: ContextMenuEventType, eventInitDict: ContextMenuEventInit) {
    const {
      clientX,
      clientY,
      menu,
      menuItem,
      triggeredByAccelerator,
      ...rest
    } = eventInitDict;

    super(type, { ...rest, bubbles: true, cancelable: true, composed: true });

    this.clientX = clientX ?? 0;
    this.clientY = clientY ?? 0;
    this.menuItem = menuItem;
    this.menu = menu;
    this.triggeredByAccelerator = triggeredByAccelerator ?? false;
  }
}
