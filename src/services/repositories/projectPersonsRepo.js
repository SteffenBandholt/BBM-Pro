// Placeholder for future person handling.
import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export function listByProject(projectId) {
  const db = readDb();
  return db.projectPersons
    .filter((p) => String(p.project_id) === String(projectId) && !p.removed_at)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

export function createPerson({ projectId, name }) {
  const db = readDb();
  const now = nowIso();
  const person = {
    id: createId(),
    project_id: projectId,
    name: name?.trim() || "Person",
    removed_at: null,
    created_at: now,
    updated_at: now,
  };
  db.projectPersons = [...db.projectPersons, person];
  writeDb(db);
  return person;
}
