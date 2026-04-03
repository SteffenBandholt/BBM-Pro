import { getDb } from "../client.js";
import { runMigrations } from "../migrations.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

function ensureProjectFirmEmployeesSchemaReady() {
  runMigrations();
}

export function listByProjectFirm(projectFirmId) {
  ensureProjectFirmEmployeesSchemaReady();
  const db = getDb();
  return db
    .prepare(`SELECT * FROM project_firm_employees WHERE project_firm_id = ? AND removed_at IS NULL ORDER BY created_at`)
    .all(projectFirmId);
}

export function activateEmployee({ projectFirmId, globalEmployeeId }) {
  ensureProjectFirmEmployeesSchemaReady();
  if (!projectFirmId) {
    throw new Error("Projektfirma fehlt.");
  }
  if (!globalEmployeeId) {
    throw new Error("Mitarbeiter fehlt.");
  }

  const db = getDb();
  const existing = db
    .prepare(
      `SELECT * FROM project_firm_employees
       WHERE project_firm_id = ? AND global_employee_id = ? AND removed_at IS NULL`,
    )
    .get(projectFirmId, globalEmployeeId);

  if (existing) {
    return existing;
  }

  const id = createId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO project_firm_employees (id, project_firm_id, global_employee_id, removed_at, created_at, updated_at)
     VALUES (?, ?, ?, NULL, ?, ?)`,
  ).run(id, projectFirmId, globalEmployeeId, now, now);

  return db.prepare(`SELECT * FROM project_firm_employees WHERE id = ?`).get(id) || null;
}

export function deactivateEmployee({ projectFirmId, globalEmployeeId }) {
  ensureProjectFirmEmployeesSchemaReady();
  const db = getDb();
  const now = nowIso();
  const existing = db
    .prepare(
      `SELECT * FROM project_firm_employees
       WHERE project_firm_id = ? AND global_employee_id = ? AND removed_at IS NULL`,
    )
    .get(projectFirmId, globalEmployeeId);

  if (!existing) {
    return null;
  }

  db.prepare(
    `UPDATE project_firm_employees
     SET removed_at = ?, updated_at = ?
     WHERE id = ?`,
  ).run(now, now, existing.id);

  return db.prepare(`SELECT * FROM project_firm_employees WHERE id = ?`).get(existing.id) || null;
}
