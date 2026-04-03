/**
 * Backend selector for repositories.
 * Default: local (localStorage). Optional: sqlite (better-sqlite3) or IPC bridge.
 * Falls back to local if sqlite not available at runtime.
 */

const isElectronMain = typeof process !== "undefined" && process?.versions?.electron && process?.type !== "renderer";
const isElectronRenderer = typeof process !== "undefined" && process?.versions?.electron && process?.type === "renderer";
const preferSqlite =
  isElectronMain ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_USE_SQLITE === "1") ||
  (typeof process !== "undefined" && process.env?.BBM_USE_SQLITE === "1");

let backend = "local";

// Lazy-loaded modules
let sqliteRepos = null;

const safeRequire = (() => {
  try {
    // eslint-disable-next-line no-eval
    return eval("require");
  } catch (_e) {
    return null;
  }
})();

function canUseNodeSqlite() {
  // Renderer with nodeIntegration false cannot require native modules.
  if (typeof window !== "undefined" && window?.document && !process?.versions?.electron) return false;
  try {
    // Test if better-sqlite3 can be resolved
    if (!safeRequire) return false;
    safeRequire("better-sqlite3");
    return true;
  } catch (_e) {
    return false;
  }
}

function loadSqlite() {
  if (sqliteRepos) return sqliteRepos;
  try {
    if (!safeRequire) throw new Error("require not available");
    const path = safeRequire("path");
    const base = path.join(process.cwd(), "src", "node-sqlite", "repos");
    const req = (file) => safeRequire(path.join(base, file));
    const proj = req("projectsRepoSqlite.js");
    const meet = req("meetingsRepoSqlite.js");
    const tops = req("topsRepoSqlite.js");
    const mtops = req("meetingTopsRepoSqlite.js");
    const globalFirms = req("globalFirmsRepoSqlite.js");
    const globalFirmEmployees = req("globalFirmEmployeesRepoSqlite.js");
    const firms = req("projectFirmsRepoSqlite.js");
    const persons = req("projectPersonsRepoSqlite.js");
    const participants = req("meetingParticipantsRepoSqlite.js");
    sqliteRepos = {
      projectsRepo: proj,
      meetingsRepo: meet,
      topsRepo: tops,
      meetingTopsRepo: mtops,
      globalFirmsRepo: globalFirms,
      globalFirmEmployeesRepo: globalFirmEmployees,
      projectFirmsRepo: firms,
      projectPersonsRepo: persons,
      meetingParticipantsRepo: participants,
    };
    backend = "sqlite";
  } catch (err) {
    backend = "local";
    sqliteRepos = null;
    console.warn("[persistence] sqlite backend unavailable, falling back to local:", err?.message || err);
  }
  return sqliteRepos;
}

// IPC repos (renderer, contextIsolation)
import * as ipcRepos from "./ipcRepos.js";

// Local repos
import * as localProjectsRepo from "./projectsRepo.js";
import * as localMeetingsRepo from "./meetingsRepo.js";
import * as localTopsRepo from "./topsRepo.js";
import * as localMeetingTopsRepo from "./meetingTopsRepo.js";
import * as localGlobalFirmsRepo from "./globalFirmsRepo.js";
import * as localGlobalFirmEmployeesRepo from "./globalFirmEmployeesRepo.js";
import * as localProjectFirmsRepo from "./projectFirmsRepo.js";
import * as localProjectPersonsRepo from "./projectPersonsRepo.js";
import * as localMeetingParticipantsRepo from "./meetingParticipantsRepo.js";

export function getRepos() {
  // Renderer path: IPC is mandatory in Electron
  if (typeof window !== "undefined") {
    if (window.desktopApi?.invoke) {
      backend = "ipc";
      return ipcRepos;
    }
    if (isElectronRenderer) {
      throw new Error("[persistence] IPC bridge missing in Electron renderer (desktopApi.invoke not available)");
    }
  }

  if (preferSqlite && canUseNodeSqlite()) {
    const sqlite = loadSqlite();
    if (sqlite) return sqlite;
    throw new Error("[persistence] SQLite preferred but could not be loaded in this runtime");
  }

  backend = "local";
  return {
    projectsRepo: localProjectsRepo,
    meetingsRepo: localMeetingsRepo,
    topsRepo: localTopsRepo,
    meetingTopsRepo: localMeetingTopsRepo,
    globalFirmsRepo: localGlobalFirmsRepo,
    globalFirmEmployeesRepo: localGlobalFirmEmployeesRepo,
    projectFirmsRepo: localProjectFirmsRepo,
    projectPersonsRepo: localProjectPersonsRepo,
    meetingParticipantsRepo: localMeetingParticipantsRepo,
  };
}

export function getBackendKind() {
  if (typeof window !== "undefined" && window.desktopApi?.invoke) return "ipc";
  if (backend === "local" && preferSqlite && canUseNodeSqlite()) {
    loadSqlite();
  }
  return backend;
}
