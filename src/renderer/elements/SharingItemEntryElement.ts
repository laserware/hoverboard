import { property } from "./ContextMenuItemElement.js";

export type SharingItemType = "filePath" | "text" | "url";

export interface SharingItemEntryAttributes {
  type: SharingItemType;
  value: string;
}

export class SharingItemEntryElement extends HTMLElement {
  @property({ type: String })
  public type: SharingItemType | undefined;

  @property({ type: String })
  public value: string | undefined;

  public get entry(): { type: SharingItemType; value: string } {
    const type = this.type;

    if (type === undefined) {
      throw new Error("A type must be defined on a sharing item entry");
    }

    if (type !== "filePath" && type !== "text" && type !== "url") {
      // biome-ignore format:
      throw new Error(`Invalid type ${type} specified for sharing item entry, only "filePath", "text", and "url" allowed`);
    }

    if (this.value === undefined) {
      throw new Error("A value must be defined on a sharing item entry");
    }

    return { type, value: this.value };
  }

  public getAttribute(name: keyof SharingItemEntryAttributes) {
    return super.getAttribute(name);
  }
}
