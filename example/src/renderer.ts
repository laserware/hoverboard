import { asElement, createElement as html } from "@laserware/dominator";

import {
  checkbox,
  contextMenu,
  normal,
  radio,
  role,
  separator,
  submenu,
} from "../../src/renderer";

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
  const element = asElement(event.currentTarget);

  const menuFunctional = contextMenu([
    normal({
      id: "delete",
      label: "Delete",
      toolTip: "Delete some stuff.",
      click() {
        window.alert("Deleted!");
      },
    }),
    checkbox({
      label: "Checkbox",
      checked: isChecked,
      click() {
        isChecked = !isChecked;
      },
    }),
    separator(),
    submenu(
      {
        id: "submenu",
        label: "Radio Options",
        sublabel: "This is a sublabel",
        click() {
          console.log("Radio options clicked");
        },
      },
      ["1", "2", "3"].map((value) =>
        radio({
          label: `Option ${value}`,
          checked: activeOption === value,
          click() {
            activeOption = value;
          },
        }),
      ),
    ),
    separator(),
    role("cut"),
    role("copy"),
    role("paste"),
  ]);

  menuFunctional.show(event.clientX, event.clientY);

  return;

  const menuWithBuilder = contextMenu((builder) => {
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
        (builder) =>
          builder.map(["1", "2", "3"], (value) =>
            builder.radio({
              label: `Option ${value}`,
              checked: activeOption === value,
              click() {
                activeOption = value;
              },
            }),
          ),
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

  // menu.addEventListener("open", () => {
  //   console.log("Opened");
  // });
  //
  // menu.addEventListener("close", () => {
  //   console.log("Closed");
  // });

  menuWithBuilder.show(event.clientX, event.clientY);
}
