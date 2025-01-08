import { asElement, createElement as html } from "@laserware/dominator";

import { ContextMenu } from "../../src/renderer";

let isChecked = false;
let activeOption = "1";

start();

function start(): void {
  const menuButton = html(
    "button",
    {
      oncontextmenu(event) {
        event.preventDefault();

        createContextMenu(event);
      },
    },
    "Menu",
  );

  document.body.appendChild(menuButton);
}

function createContextMenu(event: MouseEvent) {
  const ipcRenderer = window.require("electron").ipcRenderer;

  const menu = ContextMenu.create("Test", ipcRenderer, (builder) => {
    builder
      .normal({
        id: "delete",
        label: "Delete",
        toolTip: "Delete some stuff.",
        click() {
          window.alert("Deleted!");
        },
      })
      .checkbox({
        label: "Checkbox",
        checked: isChecked,
        click() {
          isChecked = !isChecked;
        },
      })
      .separator()
      .submenu(
        {
          id: "submenu",
          label: "Radio Options",
          sublabel: "This is a sublabel",
          click() {
            console.log("Radio options clicked");
          },
        },
        (builder) => {
          for (const value of ["1", "2", "3"]) {
            builder.radio({
              label: `Option ${value}`,
              checked: activeOption === value,
              click() {
                activeOption = value;
              },
            });
          }
          return builder;
        },
      )
      .separator()
      .role({ role: "cut" })
      .role({ role: "copy" })
      .role({ role: "paste" });

    builder.normal({
      id: "add",
      before: ["delete"],
      label: "Add",
      click() {
        console.log("YAY");
        window.alert("Added");
      },
    });

    builder.separator({ before: ["delete"] });

    return builder;
  });

  menu.addEventListener("open", () => {
    console.log("Opened");
  });

  menu.addEventListener("close", () => {
    console.log("Closed");
  });

  const element = asElement(event.currentTarget);

  menu.build().attach(element).show(event.clientX, event.clientY);
}
