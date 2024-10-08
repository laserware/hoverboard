const { app, BrowserWindow, MenuItem } = require("electron");

const {
  configureContextMenus,
  ApplicationMenu,
} = require("../../dist/main.cjs");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile("src/index.html");
}

app.whenReady().then(() => {
  configureContextMenus({
    appendInspectElementToMenus: true,
    appendLinkHandlersToMenus: true,
    enableDefaultMenu: true,
  });

  createWindow();

  ApplicationMenu.create((builder) => {
    builder
      .role({ role: "appMenu" })
      .role({ role: "fileMenu" })
      .role({ role: "editMenu" })
      .role({ role: "viewMenu" })
      .role({ role: "windowMenu" })
      .submenu({ role: "help" }, (builder) =>
        builder.normal({
          label: "Learn More",
          async click() {
            const { shell } = require("electron");
            await shell.openExternal("https://electronjs.org");
          },
        }),
      );

    return builder;
  })
    .build()
    .set();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  app.quit();
});
