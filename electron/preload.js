const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose a minimal, safe IPC bridge to the renderer.
 * Only channel-based invoke is exposed; native modules remain inaccessible.
 */
contextBridge.exposeInMainWorld('desktopApi', {
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
  ping: () => true,
});
