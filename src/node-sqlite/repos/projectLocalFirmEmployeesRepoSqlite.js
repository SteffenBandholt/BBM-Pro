import { getDb } from "../client.js";
import { runMigrations } from "../migrations.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

function ensureProjectLocalFirmEmployeesSchemaReady() {
  runMigrations();
}

export function listByProjectFirm(projectFirmId) {
  ensureProjectLocalFirmEmployeesSchemaReady();
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM project_local_firm_employees WHERE project_firm_id = ? AND removed_at IS NULL ORDER BY name`,
    )
    .all(projectFirmId);
}

export function createEmployee({ projectFirmId, name }) {
  ensureProjectLocalFirmEmployeesSchemaReady();
  const trimmedName = String(name || "").trim();
  if (!projectFirmId) {
    throw new Error("Projektfirma fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Mitarbeitername fehlt.");
  }

  const db = getDb();
  const id = createId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO project_local_firm_employees (id, project_firm_id, name, removed_at, created_at, updated_at)
     VALUES (?, ?, ?, NULL, ?, ?)`,
  ).run(id, projectFirmId, trimmedName, now, now);

  return db.prepare(`SELECT * FROM project_local_firm_employees WHERE id = ?`).get(id) || null;
}
