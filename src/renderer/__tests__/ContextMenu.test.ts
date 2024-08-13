import { ContextMenu } from "../ContextMenu.ts";
import { getDefaultIpcApi } from "../ipcApi.ts";

// Mocking `uuid` here so we can get reproducible snapshots.
vi.mock("@laserware/arcade", () => {
  let counter = 1;
  return {
    uuid: () => `random-id-${counter++}`,
  };
});

vi.mock("../ipcApi.ts");

describe("the ContextMenu class", () => {
  it("builds a context menu with a template that matches its snapshot", () => {
    const cm = ContextMenu.create("Test", (builder) =>
      builder
        .normal({ label: "Normal 1" })
        .normal({ label: "Normal 2" })
        .normal({ label: "Normal 3", visible: false })
        .role({ role: "copy", enabled: true })
        .role({ role: "paste", enabled: false })
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

    const cm = ContextMenu.create("Test", (builder) =>
      builder.normal({ label: "Normal 1" }).normal({ label: "Normal 2" }),
    )
      .build()
      .attach(element);
    expect(element).toHaveAttribute("data-context-menu-name", "Test");

    cm.dispose();
    expect(element).not.toHaveAttribute("data-context-menu-name", "Test");
  });

  it("uses the custom IPC API when specified", () => {
    const addListener = vi.fn();
    const send = vi.fn();

    const ipcApi = {
      addListener,
      removeListener: vi.fn(),
      send,
    };

    vi.mocked(getDefaultIpcApi).mockReturnValue(ipcApi);

    const element = document.createElement("div");

    const cm = ContextMenu.create("Test", (builder) =>
      builder.normal({ label: "Normal 1" }).normal({ label: "Normal 2" }),
    )
      .build()
      .attach(element)
      .show(10, 50);

    expect(addListener).toHaveBeenCalled();
    expect(send).toHaveBeenCalled();

    addListener.mockClear();
    send.mockClear();

    cm.ipcApi = ipcApi;
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
      addListener: vi.fn(),
      removeListener: vi.fn(),
      send: vi.fn(),
    };

    expect(() => {
      // @ts-ignore Intentionally omitting builder function.
      ContextMenu.create("Test", ipcApi);
    }).toThrow(/builder function is required/i);
  });

  it("throws an error if a duplicate ID is specified", () => {
    const cm = ContextMenu.create("Test", (builder) =>
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
