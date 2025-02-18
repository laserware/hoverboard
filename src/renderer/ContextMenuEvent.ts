import type { ContextMenuItem } from "./ContextMenuItem.js";

export type ContextMenuEventType = "click" | "hide" | "show";

export interface ContextMenuEventInit extends EventModifierInit {
  clientX?: number;
  clientY?: number;
  menuItem: ContextMenuItem | null;
  triggeredByAccelerator?: boolean;
}

type ContextMenuEventListener = (event: ContextMenuEvent) => void;

interface ContextMenuEventListenerObject {
  handleEvent(object: ContextMenuEvent): void;
}

export type ContextMenuEventListenerOrEventListenerObject =
  | ContextMenuEventListener
  | ContextMenuEventListenerObject;

export class ContextMenuEvent extends Event {
  public clientX: number;
  public clientY: number;
  public menuItem: ContextMenuItem | null;
  public triggeredByAccelerator: boolean;

  constructor(type: ContextMenuEventType, eventInitDict: ContextMenuEventInit) {
    const { clientX, clientY, menuItem, triggeredByAccelerator, ...rest } =
      eventInitDict;

    super(type, rest);

    this.clientX = clientX ?? 0;
    this.clientY = clientY ?? 0;
    this.menuItem = menuItem;
    this.triggeredByAccelerator = triggeredByAccelerator ?? false;
  }
}
