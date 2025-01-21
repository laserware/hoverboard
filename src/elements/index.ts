import { CheckboxMenuItemElement } from "./CheckboxMenuItemElement.js";
import { ContextMenuElement } from "./ContextMenuElement.js";
import { NormalMenuItemElement } from "./NormalMenuItemElement.js";
import { RadioMenuItemElement } from "./RadioMenuItemElement.js";
import { RoleMenuItemElement } from "./RoleMenuItemElement.js";
import { SeparatorMenuItemElement } from "./SeparatorMenuItemElement.js";
import { ShareMenuElement } from "./ShareMenuElement.js";
import { SharingItemEntryElement } from "./SharingItemEntryElement.js";
import { SubmenuMenuItemElement } from "./SubmenuMenuItemElement.js";

export {
  ContextMenuEvent,
  type ContextMenuEventInit,
  type ContextMenuEventType,
  type ContextMenuEventListenerOrEventListenerObject,
} from "./ContextMenuEvent.js";

export {
  CheckboxMenuItemElement,
  type CheckboxMenuItemAttributes,
} from "./CheckboxMenuItemElement.js";
export {
  ContextMenuElement,
  type ContextMenuAttributes,
} from "./ContextMenuElement.js";
export type { ContextMenuItemElement } from "./ContextMenuItemElement.js";
export {
  NormalMenuItemElement,
  type NormalMenuItemAttributes,
} from "./NormalMenuItemElement.js";
export {
  RadioMenuItemElement,
  type RadioMenuItemAttributes,
} from "./RadioMenuItemElement.js";
export {
  RoleMenuItemElement,
  type RoleMenuItemAttributes,
} from "./RoleMenuItemElement.js";
export {
  SeparatorMenuItemElement,
  type SeparatorMenuItemAttributes,
} from "./SeparatorMenuItemElement.js";
export {
  SubmenuMenuItemElement,
  type SubmenuMenuItemAttributes,
} from "./SubmenuMenuItemElement.js";

export function registerElements() {
  customElements.define("checkbox-menu-item", CheckboxMenuItemElement);
  customElements.define("context-menu", ContextMenuElement);
  customElements.define("normal-menu-item", NormalMenuItemElement);
  customElements.define("radio-menu-item", RadioMenuItemElement);
  customElements.define("role-menu-item", RoleMenuItemElement);
  customElements.define("separator-menu-item", SeparatorMenuItemElement);
  customElements.define("submenu-menu-item", SubmenuMenuItemElement);
  customElements.define("share-menu", ShareMenuElement);
  customElements.define("sharing-item-entry", SharingItemEntryElement);
}
