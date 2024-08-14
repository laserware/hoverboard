import { ContextMenu } from "./hoverboard.mjs";

let isChecked = false;
let activeOption = "1";

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menu");

  menuButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    createContextMenu(event);
  });
});

function createContextMenu(event) {
  const menu = ContextMenu.create("Test", (builder) => {
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
        window.alert("Added");
      },
    });

    builder.separator({ before: ["delete"] });

    return builder;
  });

  menu.build().attach(event.currentTarget).show(event.clientX, event.clientY);
}
