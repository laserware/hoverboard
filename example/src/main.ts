import { join } from "node:path";

import { BrowserWindow, app } from "electron";

import { configureContextMenus } from "../../src/main";

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: join(__dirname, "..", "preload", "preload.js"),
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
    inspectElement: true,
    linkHandlers: true,
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
