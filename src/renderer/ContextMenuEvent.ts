export type ContextMenuEventType = "click" | "hide" | "show";

export interface ContextMenuEventInit extends EventModifierInit {
  clientX?: number;
  clientY?: number;
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
  public triggeredByAccelerator: boolean;
  public clientX: number | undefined;
  public clientY: number | undefined;

  constructor(
    type: ContextMenuEventType,
    eventInitDict: ContextMenuEventInit = {},
  ) {
    const { clientX, clientY, triggeredByAccelerator, ...rest } = eventInitDict;

    super(type, rest);

    this.clientX = clientX;
    this.clientY = clientY;
    this.triggeredByAccelerator = triggeredByAccelerator ?? false;
  }
}
