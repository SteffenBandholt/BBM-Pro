import { getDb } from "../client.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

export function listByProject(projectId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM project_firms WHERE project_id = ? AND removed_at IS NULL ORDER BY name`)
    .all(projectId);
}

export function getById(firmId) {
  const db = getDb();
  return db.prepare(`SELECT * FROM project_firms WHERE id = ?`).get(firmId) || null;
}

export function createFirm({ projectId, name, shortLabel = "" }) {
  const db = getDb();
  const now = nowIso();
  const id = createId();
  db.prepare(
    `INSERT INTO project_firms (id, project_id, name, short_label, removed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL, ?, ?)`,
  ).run(id, projectId, name?.trim() || "Firma", shortLabel?.trim() || name || "Firma", now, now);
  return getById(id);
}

export function ensureSampleFirms(projectId) {
  const existing = listByProject(projectId);
  if (existing.length > 0) return existing;
  createFirm({ projectId, name: "Musterbau GmbH", shortLabel: "Musterbau" });
  createFirm({ projectId, name: "Planung AG", shortLabel: "Planung" });
  return listByProject(projectId);
}
