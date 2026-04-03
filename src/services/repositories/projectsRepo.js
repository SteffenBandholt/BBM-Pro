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

export function createProject({
  name = "",
  number = "",
  city = "",
  status = "geplant",
  description = "",
  startDate = "",
  endDate = "",
} = {}) {
  const db = readDb();
  const id = createId();
  const now = nowIso();
  const project = {
    id,
    name,
    number,
    city,
    status,
    description,
    startDate,
    endDate,
    created_at: now,
    updated_at: now,
  };
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
      status: patch.status ?? p.status ?? "geplant",
      description: patch.description ?? p.description ?? "",
      startDate: patch.startDate ?? p.startDate ?? "",
      endDate: patch.endDate ?? p.endDate ?? "",
      updated_at: nowIso(),
    };
    return updated;
  });
  if (!updated) {
    throw new Error("Projekt wurde nicht gefunden.");
  }
  writeDb(db);
  return updated;
}
