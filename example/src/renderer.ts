import { asElement, createElement as html } from "@laserware/dominator";

import {
  CheckboxMenuItemElement,
  type ContextMenuElement,
  type ContextMenuItemElement,
  type ContextMenuEvent as ElementsContextMenuEvent,
  RadioMenuItemElement,
  type SubmenuMenuItemElement,
  registerElements,
} from "../../src/elements";
import {
  RadioMenuItem,
  type ContextMenuEvent as RendererContextMenuEvent,
  contextMenu,
  items,
} from "../../src/renderer";

let isChecked = false;
let activeOption = "1";

start();

function start(): void {
  // createEditorMenu();
  createElementsContextMenu();
  // createImperativeContextMenu();

  const menuButton = html(
    "button",
    { dataset: { editorTab: "" } },
    html("a", { href: "https://google.com" }, "Tab"),
  );

  document.body.appendChild(menuButton);
}

function createEditorMenu(): void {
  const menu = contextMenu((builder) =>
    builder
      .normal({
        id: "close-editor",
        label: "Close",
        accelerator: "CommandOrControl+W",
      })
      .normal({
        id: "close-others",
        label: "Close Others",
        accelerator: "CommandOrControl+Alt+T",
      })
      .normal({
        id: "close-to-right",
        label: "Close to the Right",
      })
      .normal({
        id: "close-saved",
        label: "Close Saved",
      })
      .normal({
        id: "close-all",
        label: "Close All",
      })
      .separator()
      .normal({
        id: "copy-path",
        label: "Copy Path",
        accelerator: "CommandOrControl+Shift+C",
      })
      .normal({
        id: "copy-relative-path",
        label: "Copy Relative Path",
        accelerator: "CommandOrControl+Alt+Shift+C",
      })
      .separator()
      .normal({ id: "reopen-editor-with", label: "Reopen Editor With..." })
      .separator()
      .normal({ id: "pin-tab", label: "Pin" })
      .separator()
      .normal({ id: "split-up", label: "Split Up" })
      .normal({ id: "split-down", label: "Split Down" })
      .normal({ id: "split-left", label: "Split Left" })
      .normal({ id: "split-right", label: "Split Right" })
      .separator()
      .normal({ id: "split-in-group", label: "Split in Group" })
      .separator()
      .normal({ id: "move-into-new-window", label: "Move into New Window" })
      .normal({ id: "copy-into-new-window", label: "Copy into New Window" }),
  );

  menu.addEventListener("click", (event) => {
    console.log(event.menuItem);
  });

  window.addEventListener("contextmenu", async (event) => {
    await menu.show(event.clientX, event.clientY);
  });
}

function createImperativeContextMenu(): void {
  const menu = contextMenu([
    items.normal({
      id: "delete",
      label: "Delete",
      toolTip: "Delete some stuff.",
      click() {
        window.alert("Deleted!");
      },
    }),
    items.checkbox({
      label: "Checkbox",
      checked: isChecked,
      click() {
        isChecked = !isChecked;
      },
    }),
    items.separator(),
    items.submenu(
      {
        id: "submenu",
        label: "Radio Options",
        toolTip: "Hello!",
      },
      ["1", "2", "3"].map((value) =>
        items.radio({
          id: `radio-${value}`,
          label: `Option ${value}`,
          checked: activeOption === value,
          click() {
            activeOption = value;
          },
        }),
      ),
    ),
    items.separator(),
    // items.shareMenu({ urls: ["https://google.com"] }),
    items.role({
      role: "cut",
      accelerator: "CommandOrControl+X",
    }),
  ]);

  menu.addEventListener("show", (event: RendererContextMenuEvent) => {
    console.log("Shown", event);
  });

  menu.addEventListener("hide", (event: RendererContextMenuEvent) => {
    console.log("Hidden", event);
  });

  menu.addEventListener("click", (event: RendererContextMenuEvent) => {
    console.log("Clicked", event);
  });

  const menuButton = html(
    "button",
    {
      async oncontextmenu(event) {
        event.preventDefault();

        const element = asElement(event.currentTarget);

        const clickedItem = await menu.show(event.clientX, event.clientY);

        if (clickedItem instanceof RadioMenuItem) {
          clickedItem.select();
        }
      },
    },
    html("a", { href: "https://google.com" }, "MENU"),
  );

  document.body.appendChild(menuButton);
}

function createElementsContextMenu(): void {
  const menuButton = html("button", "Menu");

  registerElements();

  document.body.appendChild(menuButton);

  const wrapper = html("div");
  wrapper.innerHTML = `
  <context-menu id="menu" target="[data-editor-tab]">
    <normal-menu-item id="delete" label="Delete" tooltip="Delete some stuff."></normal-menu-item>
    <normal-menu-item id="add" label="Add"></normal-menu-item>
    <separator-menu-item></separator-menu-item>
    <normal-menu-item label="Remove"></normal-menu-item>
    <submenu-menu-item label="Checkboxes" id="checkboxes">
      <checkbox-menu-item checked="true" label="Item A"></checkbox-menu-item>
      <checkbox-menu-item label="Item B"></checkbox-menu-item>
      <checkbox-menu-item label="Item C"></checkbox-menu-item>
    </submenu-menu-item>
    <separator-menu-item></separator-menu-item>
    <submenu-menu-item label="Radio" id="radios">
      <radio-menu-item label="Item A"></radio-menu-item>
      <radio-menu-item label="Item B"></radio-menu-item>
      <radio-menu-item label="Item C"></radio-menu-item>
    </submenu-menu-item>
    <separator-menu-item></separator-menu-item>
    <share-menu>
      <sharing-item-entry type="url" value="https://google.com"></sharing-item-entry>
    </share-menu>
    <role-menu-item of="cut"></role-menu-item>
    <role-menu-item of="copy"></role-menu-item>
    <role-menu-item of="paste"></role-menu-item>
  </context-menu>
  `;

  document.body.appendChild(wrapper);

  const checkboxes = document.querySelector(
    "#checkboxes",
  ) as SubmenuMenuItemElement;

  const radios = document.querySelector("#radios") as SubmenuMenuItemElement;

  checkboxes.addEventListener("click", (event: ElementsContextMenuEvent) => {
    const element = event.target as ContextMenuItemElement;

    for (const child of element.parentElement as SubmenuMenuItemElement) {
      if (element !== child) {
        continue;
      }

      if (child instanceof CheckboxMenuItemElement) {
        child.checked = !child.checked;
      }
    }
  });

  radios.addEventListener("click", (event: ElementsContextMenuEvent) => {
    const element = event.target as ContextMenuItemElement;

    const parent = element.parentElement as SubmenuMenuItemElement;

    for (const child of parent) {
      if (child instanceof RadioMenuItemElement) {
        child.checked = child === element;
      }
    }
  });

  const menu = document.querySelector<ContextMenuElement>("#menu");

  // item.addEventListener("click", (event: ElementsContextMenuEvent) => {
  //   console.log("CLICK", event.menuItem);
  // });

  menu.addEventListener("attach", (event: ElementsContextMenuEvent) => {
    console.log(event.trigger);
    // console.log("SHOW", event.menu.toTemplate());
  });

  menu.addEventListener("hide", (event: ElementsContextMenuEvent) => {
    // console.log("HIDE", event.menu, event.menuItem);
  });

  // setInterval(() => {
  //   console.log("TOGGLE");
  //   menu.open = !menu.open;
  // }, 3000);
}
