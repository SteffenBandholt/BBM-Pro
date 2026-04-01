import { getBackendKind } from "./repositories/index.js";

let migrationsRun = false;

export async function initPersistence() {
  if (migrationsRun) return;
  if (getBackendKind() !== "sqlite") {
    migrationsRun = true;
    return;
  }
  try {
    const safeRequire = (() => {
      try {
        // eslint-disable-next-line no-eval
        return eval("require");
      } catch (_e) {
        return null;
      }
    })();
    if (!safeRequire) throw new Error("require not available in this runtime");
    const { runMigrations } = safeRequire("../node-sqlite/migrations.js");
    runMigrations();
    migrationsRun = true;
  } catch (err) {
    console.warn("[persistence] migrations failed, fallback to local backend will remain in effect", err?.message || err);
  }
}
