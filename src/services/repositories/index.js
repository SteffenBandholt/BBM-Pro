/**
 * Backend selector for repositories.
 * Default: local (localStorage). Optional: sqlite (better-sqlite3).
 * Falls back to local if sqlite not available at runtime.
 */

const preferSqlite =
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
    // Use dynamic require to avoid bundler issues in browser build
    const proj = safeRequire("../../node-sqlite/repos/projectsRepoSqlite.js");
    const meet = safeRequire("../../node-sqlite/repos/meetingsRepoSqlite.js");
    const tops = safeRequire("../../node-sqlite/repos/topsRepoSqlite.js");
    const mtops = safeRequire("../../node-sqlite/repos/meetingTopsRepoSqlite.js");
    const firms = safeRequire("../../node-sqlite/repos/projectFirmsRepoSqlite.js");
    const persons = safeRequire("../../node-sqlite/repos/projectPersonsRepoSqlite.js");
    const participants = safeRequire("../../node-sqlite/repos/meetingParticipantsRepoSqlite.js");
    sqliteRepos = {
      projectsRepo: proj,
      meetingsRepo: meet,
      topsRepo: tops,
      meetingTopsRepo: mtops,
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

// Local repos
import * as localProjectsRepo from "./projectsRepo.js";
import * as localMeetingsRepo from "./meetingsRepo.js";
import * as localTopsRepo from "./topsRepo.js";
import * as localMeetingTopsRepo from "./meetingTopsRepo.js";
import * as localProjectFirmsRepo from "./projectFirmsRepo.js";
import * as localProjectPersonsRepo from "./projectPersonsRepo.js";
import * as localMeetingParticipantsRepo from "./meetingParticipantsRepo.js";

export function getRepos() {
  if (preferSqlite && canUseNodeSqlite()) {
    const sqlite = loadSqlite();
    if (sqlite) return sqlite;
  }
  return {
    projectsRepo: localProjectsRepo,
    meetingsRepo: localMeetingsRepo,
    topsRepo: localTopsRepo,
    meetingTopsRepo: localMeetingTopsRepo,
    projectFirmsRepo: localProjectFirmsRepo,
    projectPersonsRepo: localProjectPersonsRepo,
    meetingParticipantsRepo: localMeetingParticipantsRepo,
  };
}

export function getBackendKind() {
  if (backend === "local" && preferSqlite && canUseNodeSqlite()) {
    loadSqlite();
  }
  return backend;
}
