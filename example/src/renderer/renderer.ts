import { asElement, createElement as html } from "@laserware/dominator";

import {
  CheckboxMenuItemElement,
  type ContextMenuElement,
  type ContextMenuItemElement,
  type ContextMenuEvent as ElementsContextMenuEvent,
  RadioMenuItemElement,
  type SubmenuMenuItemElement,
  registerElements,
} from "../../../src/elements";
import {
  RadioMenuItem,
  type ContextMenuEvent as RendererContextMenuEvent,
  contextMenu,
  items,
} from "../../../src/renderer";

let isChecked = false;
let activeOption = "1";

start();

function start(): void {
  createElementsContextMenu();
  // createImperativeContextMenu();

  const menuButton = html(
    "button",
    { dataset: { editorTab: "" } },
    html("a", { href: "https://google.com" }, "Tab"),
  );

  document.body.appendChild(menuButton);
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
  const menuButton = html("button", { id: "show-menu" }, "Menu");
  const otherButton = html("button", "Other");

  let enabled = false;

  otherButton.addEventListener("click", () => {
    enabled = !enabled;
  });

  registerElements();

  document.body.appendChild(menuButton);

  const wrapper = html("div");
  wrapper.innerHTML = `
  <context-menu id="menu" target="#show-menu">
    <normal-menu-item id="delete" label="Delete" tooltip="Delete some stuff."></normal-menu-item>
    <normal-menu-item id="add" label="Add"></normal-menu-item>
    <separator-menu-item></separator-menu-item>
    <normal-menu-item label="Remove" enabled="${enabled}"></normal-menu-item>
    <submenu-menu-item label="Checkboxes" id="checkboxes">
      <checkbox-menu-item checked="true" label="Item A"></checkbox-menu-item>
      <checkbox-menu-item label="Item B"></checkbox-menu-item>
      <checkbox-menu-item label="Item C"></checkbox-menu-item>
    </submenu-menu-item>
    <separator-menu-item></separator-menu-item>
    <submenu-menu-item label="Radio" id="radios">
      <radio-menu-item id="item-a" label="Item A"></radio-menu-item>
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
  // document.body.appendChild(otherButton);

  document.querySelector("#item-a")!.addEventListener("click", (event) => {
    console.log("BUTTON", event);
  });

  const menu = document.querySelector<ContextMenuElement>("#menu");

  menu.addEventListener("click", (event: ElementsContextMenuEvent) => {
    console.log("MENU", event);
  });

  // menu.attachTo(menuButton);

  const checkboxes = document.querySelector(
    "#checkboxes",
  ) as SubmenuMenuItemElement;

  const radios = document.querySelector("#radios") as SubmenuMenuItemElement;

  checkboxes.addEventListener("click", (event: ElementsContextMenuEvent) => {
    const element = event.target as ContextMenuItemElement;

    for (const child of element.submenu!) {
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

  // item.addEventListener("click", (event: ElementsContextMenuEvent) => {
  //   console.log("CLICK", event.menuItem);
  // });

  menu.addEventListener("attach", (event: ElementsContextMenuEvent) => {
    console.log(event.trigger);
    // console.log("SHOW", event.menu.toTemplate());
  });

  // menu.addEventListener("hide", (event: ElementsContextMenuEvent) => {
  //   console.log("HIDE", event.menu, event.menuItem);
  // });

  // setInterval(() => {
  //   console.log("TOGGLE");
  //   menu.open = !menu.open;
  // }, 3000);
}
