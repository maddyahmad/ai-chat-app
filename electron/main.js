import { app, BrowserWindow, ipcMain, safeStorage } from "electron";
import * as path from "node:path";
import * as fs from "node:fs";

// Store encrypted auth on disk (not localStorage — that's renderer-only)
const AUTH_FILE = path.join(app.getPath("userData"), "auth.enc");

function saveAuth(data) {
  const json = JSON.stringify(data);
  const encrypted = safeStorage.encryptString(json);
  fs.writeFileSync(AUTH_FILE, encrypted);
}

function loadAuth() {
  if (!fs.existsSync(AUTH_FILE)) return null;
  try {
    const encrypted = fs.readFileSync(AUTH_FILE);
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

function clearAuth() {
  if (fs.existsSync(AUTH_FILE)) fs.unlinkSync(AUTH_FILE);
}

// Wire up IPC handlers
ipcMain.handle("auth:save", (_event, data) => saveAuth(data));
ipcMain.handle("auth:load", () => loadAuth());
ipcMain.handle("auth:clear", () => clearAuth());

const preloadPath = path.join(__dirname, "preload.js");
console.log("Preload path:", preloadPath);
console.log("Preload exists:", fs.existsSync(preloadPath));

function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // required for contextBridge
      nodeIntegration: false, // keep Node out of the renderer
    },
  });

  win.loadURL(
    process.env.VITE_DEV_SERVER_URL ??
    `file://${path.join(__dirname, "../dist/index.html")}`,
  );
}

app.whenReady().then(createWindow);
