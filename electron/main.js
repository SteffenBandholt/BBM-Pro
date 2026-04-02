import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ipcMain } from 'electron';
import { runMigrations } from './sqliteBootstrap.js';
import { registerDbIpcHandlers } from './ipcHandlers.js';

const require = createRequire(import.meta.url);
const electron = require('electron');
const { app, BrowserWindow } = electron;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
const LOG_PREFIX = '[main]';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL(devServerUrl);
    console.info(`${LOG_PREFIX} dev window using ${devServerUrl}`);
    return win;
  }

  win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  console.info(`${LOG_PREFIX} prod window loaded (dist/index.html)`);
  return win;
}

app.whenReady().then(() => {
  try {
    runMigrations();
    registerDbIpcHandlers(ipcMain);
    console.info('[main] SQLite ready, IPC handlers registered.');
  } catch (err) {
    console.error('[main] migrations/ipc init failed:', err);
    app.quit();
    return;
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
