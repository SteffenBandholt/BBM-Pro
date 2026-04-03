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

export function createProject({
  name = "",
  number = "",
  city = "",
  status = "geplant",
  description = "",
  startDate = "",
  endDate = "",
} = {}) {
  const db = getDb();
  const id = createId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO projects (id, name, number, city, status, description, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    name,
    number,
    city,
    status || "geplant",
    description || "",
    startDate || "",
    endDate || "",
    now,
    now,
  );
  return getProjectById(id);
}

export function updateProject(projectId, patch = {}) {
  const db = getDb();
  const now = nowIso();
  db.prepare(
    `UPDATE projects
     SET name = COALESCE(?, name),
         number = COALESCE(?, number),
         city = COALESCE(?, city),
         status = COALESCE(?, status),
         description = COALESCE(?, description),
         start_date = COALESCE(?, start_date),
         end_date = COALESCE(?, end_date),
         updated_at = ?
     WHERE id = ?`,
  ).run(
    patch.name ?? null,
    patch.number ?? null,
    patch.city ?? null,
    patch.status ?? null,
    patch.description ?? null,
    patch.startDate ?? null,
    patch.endDate ?? null,
    now,
    projectId,
  );
  const updatedProject = getProjectById(projectId);
  if (!updatedProject) {
    throw new Error("Projekt wurde nicht gefunden.");
  }
  return updatedProject;
}
