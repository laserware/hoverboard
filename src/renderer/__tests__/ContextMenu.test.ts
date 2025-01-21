import { describe, expect, it, mock } from "bun:test";

import { contextMenu } from "../ContextMenu.js";

describe("the ContextMenu class", () => {
  it("builds a context menu with a template that matches its snapshot", () => {
    const cm = contextMenu((builder) =>
      builder
        .normal({ label: "Normal 1" })
        .normal({ label: "Normal 2" })
        .normal({ label: "Normal 3", visible: false })
        .role({ role: "copy" })
        .role({ role: "paste" })
        .separator()
        .checkbox({ label: "Check 1", checked: true })
        .checkbox({ label: "Check 2", checked: false })
        .submenu({ label: "Submenu" }, (builder) =>
          builder
            .radio({ label: "Radio 1", checked: true })
            .radio({ label: "Radio 2", checked: false })
            .radio({ label: "Radio 3", checked: false }),
        ),
    );

    expect(cm.toTemplate()).toMatchSnapshot();
  });
});
