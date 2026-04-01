import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('desktopApi', {
  ping: () => 'bbm-pro-desktop',
});
