import { join } from "node:path";

import { BrowserWindow, app } from "electron";

import { configureContextMenus } from "../../src/main";

void start();

async function start(): Promise<void> {
  await app.whenReady();

  configureContextMenus({
    inspectElement: true,
    linkHandlers: true,
  });

  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("window-all-closed", () => {
    app.quit();
  });
}

function pause(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: join(__dirname, "..", "preload", "preload.js"),
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  await pause();

  const isDevelopment = /development/gi.test(import.meta.env.MODE);

  if (isDevelopment) {
    const port = Number(__DEV_SERVER_PORT__);

    mainWindow.loadURL(`http://localhost:${port}/index.html`).then(() => {
      mainWindow.webContents.openDevTools();
    });
  } else {
    mainWindow.loadFile("dist/renderer/index.html");
  }
}
