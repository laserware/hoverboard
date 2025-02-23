<script lang="ts">
  import { onMount } from "svelte";
  import {
    contextMenu,
    type ContextMenuEvent as RendererContextMenuEvent,
    items,
  } from "../../../../src/renderer";

  let element = $state<HTMLElement | null>(null);
  let checked = $state(false);
  let active = $state("1");

  onMount(() => {
    const controller = new AbortController();

    const { signal } = controller;

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
        checked,
        click() {
          checked = !checked;
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
            checked: active === value,
            click() {
              active = value;
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
    }, { signal });

    menu.addEventListener("hide", (event: RendererContextMenuEvent) => {
      console.log("Hidden", event);
    }, { signal });

    menu.addEventListener("click", (event: RendererContextMenuEvent) => {
      console.log("Clicked", event);
    }, { signal });

    element!.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      menu.show(event.clientX, event.clientY);
    })

    return () => {
      controller.abort();
    }
  });
</script>

<style>
</style>

<button bind:this={element}>
  Imperative
</button>
