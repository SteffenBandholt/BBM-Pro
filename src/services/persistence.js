import { getBackendKind } from "./repositories/index.js";

let migrationsRun = false;

export async function initPersistence() {
  // Migrations are executed in the Electron main process.
  // Renderer no longer triggers migrations directly.
  migrationsRun = true;
}
