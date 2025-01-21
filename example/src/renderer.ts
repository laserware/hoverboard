import {
  asElement,
  createElement,
  createElement as html,
} from "@laserware/dominator";

import {
  type ContextMenu,
  type ContextMenuEvent,
  RadioMenuItem,
  contextMenu,
  items,
} from "../../src/renderer";

let isChecked = false;
let activeOption = "1";

start();

function start(): void {
  const menu = createContextMenu();

  menu.addEventListener("show", (event: ContextMenuEvent) => {
    console.log("Shown", event);
  });

  menu.addEventListener("hide", (event: ContextMenuEvent) => {
    console.log("Hidden", event);
  });

  menu.addEventListener("click", (event: ContextMenuEvent) => {
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
    createElement(
      "a",
      {
        href: "https://google.com",
      },
      "MENU",
    ),
  );

  document.body.appendChild(menuButton);
}

function createContextMenu(): ContextMenu {
  return contextMenu([
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
    items.shareMenu({ urls: ["https://google.com"] }),
    items.role({
      role: "cut",
      accelerator: "CommandOrControl+X",
    }),
  ]);
}
