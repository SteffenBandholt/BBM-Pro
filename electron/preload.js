import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const electron = require('electron');
const { contextBridge } = electron;

contextBridge.exposeInMainWorld('desktopApi', {
  ping: () => 'bbm-pro-desktop',
});
