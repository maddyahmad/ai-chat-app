import { contextBridge, ipcRenderer } from "electron";
console.log("Preload running");
contextBridge.exposeInMainWorld("electronAPI", {
  saveAuth: (data) => ipcRenderer.invoke("auth:save", data),
  loadAuth: () => ipcRenderer.invoke("auth:load"),
  clearAuth: () => ipcRenderer.invoke("auth:clear"),
});
