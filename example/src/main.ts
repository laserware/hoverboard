import { BrowserWindow, app } from "electron";
import { ApplicationMenu, configureContextMenus } from "../../src/main";

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

  const isDevelopment = /development/gi.test(import.meta.env.MODE);

  if (isDevelopment) {
    const port = Number(__DEV_SERVER_PORT__);

    mainWindow.loadURL(`http://localhost:${port}/index.html`);
  } else {
    mainWindow.loadFile("dist/renderer/index.html");
  }
}

app.whenReady().then(() => {
  configureContextMenus({
    appendInspectElementToMenus: true,
    appendLinkHandlersToMenus: true,
    enableDefaultMenu: true,
  });

  createWindow();

  const menu = ApplicationMenu.create((builder) => {
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

  menu.addListener("click", (...args) => {
    console.log(args);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
