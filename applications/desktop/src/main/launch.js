import path from "path";

import { Menu, shell, BrowserWindow, dialog, ipcMain as ipc } from "electron";

import { loadFullMenu } from "./menu";

let launchIpynb;

export function getPath(url) {
  const nUrl = url.substring(url.indexOf("static"), path.length);
  return path.join(__dirname, "..", "..", nUrl.replace("static/", ""));
}

export function deferURL(event, url) {
  event.preventDefault();
  if (!url.startsWith("file:")) {
    shell.openExternal(url);
  } else if (url.endsWith(".ipynb")) {
    launchIpynb(getPath(url));
  }
}

const iconPath = path.join(__dirname, "..", "static", "icon.png");

const initContextMenu = require("electron-context-menu");

// Setup right-click context menu for all BrowserWindows
initContextMenu();

export function launch(filename) {
  let win = new BrowserWindow({
    width: 800,
    height: 1000,
    icon: iconPath,
    title: "nteract",
    show: false
  });

  win.once("ready-to-show", () => {
    win.show();
  });
  const index = path.join(__dirname, "..", "..", "static", "index.html");
  win.loadURL(`file://${index}`);

  win.webContents.on("will-prevent-unload", e => {
    const response = dialog.showMessageBox({
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirm",
      message: "Unsaved data will be lost. Are you sure you want to quit?"
    });
    if (response == 0) {
      e.preventDefault();
    }
  });

  win.webContents.on("did-finish-load", () => {
    const menu = loadFullMenu();
    Menu.setApplicationMenu(menu);
    if (filename) {
      win.webContents.send("main:load", filename);
    }
    win.webContents.send("main:load-config");
  });

  win.webContents.on("will-navigate", deferURL);

  win.on("focus", () => {
    const menu = loadFullMenu();
    Menu.setApplicationMenu(menu);
  });

  win.on("show", () => {
    const menu = loadFullMenu();
    Menu.setApplicationMenu(menu);
  });

  // Emitted when the window is closed.
  win.on("closed", () => {
    const menu = loadFullMenu();
    Menu.setApplicationMenu(menu);
    win = null;
  });
  return win;
}
launchIpynb = launch;

export function launchNewNotebook(kernelSpec) {
  const win = launch();
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("main:new", kernelSpec);
  });
  return win;
}
