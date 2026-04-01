import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";

function nowIso() {
  return new Date().toISOString();
}

export function listProjects() {
  const db = readDb();
  return db.projects.slice();
}

export function getProjectById(projectId) {
  const db = readDb();
  return db.projects.find((p) => String(p.id) === String(projectId)) || null;
}

export function createProject({ name = "", number = "", city = "" } = {}) {
  const db = readDb();
  const id = createId();
  const now = nowIso();
  const project = { id, name, number, city, created_at: now, updated_at: now };
  db.projects = [project, ...db.projects];
  writeDb(db);
  return project;
}

export function updateProject(projectId, patch = {}) {
  const db = readDb();
  let updated = null;
  db.projects = db.projects.map((p) => {
    if (String(p.id) !== String(projectId)) return p;
    updated = {
      ...p,
      name: patch.name ?? p.name,
      number: patch.number ?? p.number,
      city: patch.city ?? p.city,
      updated_at: nowIso(),
    };
    return updated;
  });
  writeDb(db);
  return updated;
}
