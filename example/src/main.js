const { app, BrowserWindow } = require("electron");

const { configureContextMenus } = require("../../dist/main.cjs");

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

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", function () {
  app.quit();
});
