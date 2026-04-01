export function isElectronRuntime() {
  return typeof window !== 'undefined' && typeof window.desktopApi?.ping === 'function';
}
