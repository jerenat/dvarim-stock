// electron/preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getVersion: () => ipcRenderer.invoke("get-version"),
});