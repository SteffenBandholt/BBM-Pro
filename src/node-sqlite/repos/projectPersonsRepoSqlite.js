import { getDb } from "../client.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

export function listByProject(projectId) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM project_persons WHERE project_id = ? AND removed_at IS NULL ORDER BY name`)
    .all(projectId);
}

export function createPerson({ projectId, name }) {
  const db = getDb();
  const now = nowIso();
  const id = createId();
  db.prepare(
    `INSERT INTO project_persons (id, project_id, name, removed_at, created_at, updated_at)
     VALUES (?, ?, ?, NULL, ?, ?)`,
  ).run(id, projectId, name?.trim() || "Person", now, now);
  return { id, project_id: projectId, name, created_at: now, updated_at: now };
}
