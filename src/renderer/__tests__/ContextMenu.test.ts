import { describe, expect, it, mock } from "bun:test";

import { getAttribute } from "@laserware/dominator";
import { ContextMenu } from "../ContextMenu.js";

// Mocking `uuid` here so we can get reproducible snapshots.
mock.module("@laserware/arcade", () => {
  let counter = 1;
  return {
    uuid: () => `random-id-${counter++}`,
  };
});

describe("the ContextMenu class", () => {
  it("builds a context menu with a template that matches its snapshot", () => {
    const ipcApi = {
      addListener: mock(),
      removeListener: mock(),
      send: mock(),
    };

    const cm = ContextMenu.create("Test", ipcApi, (builder) =>
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
    ).build();

    expect(cm.template).toMatchSnapshot();
  });

  it("adds a dataset property to the attached element and removes it when disposed", () => {
    const element = document.createElement("div");

    const ipcApi = {
      addListener: mock(),
      removeListener: mock(),
      send: mock(),
    };

    const cm = ContextMenu.create("Test", ipcApi, (builder) =>
      builder.normal({ label: "Normal 1" }).normal({ label: "Normal 2" }),
    )
      .build()
      .attach(element);
    expect(getAttribute(element, "data-context-menu-name")).toBe("Test");

    cm.dispose();
    expect(getAttribute(element, "data-context-menu-name")).toBeNull();
  });

  it("uses the custom IPC API when specified", () => {
    const addListener = mock();
    const send = mock();

    const ipcApi = {
      addListener,
      removeListener: mock(),
      send,
    };

    const element = document.createElement("div");

    const cm = ContextMenu.create("Test", ipcApi, (builder) =>
      builder.normal({ label: "Normal 1" }).normal({ label: "Normal 2" }),
    )
      .build()
      .attach(element)
      .show(10, 50);

    expect(addListener).toHaveBeenCalled();
    expect(send).toHaveBeenCalled();

    addListener.mockClear();
    send.mockClear();

    cm.withIpcApi(ipcApi);
    cm.show(10, 50);

    expect(addListener).toHaveBeenCalled();
    expect(send).toHaveBeenCalled();

    addListener.mockClear();
    send.mockClear();

    ContextMenu.create("Test", ipcApi, (builder) =>
      builder.normal({ label: "Normal 1" }).normal({ label: "Normal 2" }),
    )
      .build()
      .attach(element)
      .show(10, 50);

    expect(addListener).toHaveBeenCalled();
    expect(send).toHaveBeenCalled();
  });

  it("throws an error if a builder function is missing from the constructor", () => {
    const ipcApi = {
      addListener: mock(),
      removeListener: mock(),
      send: mock(),
    };

    expect(() => {
      // @ts-ignore Intentionally omitting builder function.
      ContextMenu.create("Test", ipcApi);
    }).toThrow(/builder function is required/i);
  });

  it("throws an error if a duplicate ID is specified", () => {
    const ipcApi = {
      addListener: mock(),
      removeListener: mock(),
      send: mock(),
    };

    const cm = ContextMenu.create("Test", ipcApi, (builder) =>
      builder
        .normal({ id: "1", label: "Normal 1" })
        .normal({ id: "1", label: "Normal 2" })
        .normal({ id: "1", label: "Normal 3", visible: false }),
    );

    expect(() => {
      cm.build();
    }).toThrow(/duplicate ID/i);
  });
});
