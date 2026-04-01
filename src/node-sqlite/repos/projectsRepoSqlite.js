import { getDb } from "../client.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

export function listProjects() {
  const db = getDb();
  return db.prepare(`SELECT * FROM projects ORDER BY created_at DESC`).all();
}

export function getProjectById(projectId) {
  const db = getDb();
  return db.prepare(`SELECT * FROM projects WHERE id = ?`).get(projectId) || null;
}

export function createProject({ name = "", number = "", city = "" } = {}) {
  const db = getDb();
  const id = createId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO projects (id, name, number, city, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, name, number, city, now, now);
  return getProjectById(id);
}

export function updateProject(projectId, patch = {}) {
  const db = getDb();
  const now = nowIso();
  db.prepare(
    `UPDATE projects SET name = COALESCE(?, name), number = COALESCE(?, number), city = COALESCE(?, city), updated_at = ? WHERE id = ?`,
  ).run(patch.name ?? null, patch.number ?? null, patch.city ?? null, now, projectId);
  return getProjectById(projectId);
}
