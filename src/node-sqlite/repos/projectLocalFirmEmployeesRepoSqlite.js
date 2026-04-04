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

export function getById(employeeId) {
  ensureProjectLocalFirmEmployeesSchemaReady();
  const db = getDb();
  return db
    .prepare(`SELECT * FROM project_local_firm_employees WHERE id = ? AND removed_at IS NULL`)
    .get(employeeId) || null;
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

export function updateEmployee({ employeeId, name }) {
  ensureProjectLocalFirmEmployeesSchemaReady();
  const trimmedName = String(name || "").trim();
  if (!employeeId) {
    throw new Error("Mitarbeiter fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Mitarbeitername fehlt.");
  }

  const db = getDb();
  const now = nowIso();
  const info = db.prepare(
    `UPDATE project_local_firm_employees
     SET name = ?, updated_at = ?
     WHERE id = ? AND removed_at IS NULL`,
  ).run(trimmedName, now, employeeId);

  if (!info.changes) {
    throw new Error("Projektinterner Mitarbeiter wurde nicht gefunden.");
  }

  return db.prepare(`SELECT * FROM project_local_firm_employees WHERE id = ?`).get(employeeId) || null;
}

export function removeEmployee(employeeId) {
  ensureProjectLocalFirmEmployeesSchemaReady();
  if (!employeeId) {
    throw new Error("Mitarbeiter fehlt.");
  }

  const db = getDb();
  const currentEmployee = getById(employeeId);
  if (!currentEmployee) {
    throw new Error("Projektinterner Mitarbeiter wurde nicht gefunden.");
  }

  const openMeetingParticipant = db
    .prepare(
      `SELECT m.id
       FROM meeting_person_participants participant
       JOIN meetings m ON m.id = participant.meeting_id
       WHERE participant.person_kind = 'project_local_employee'
         AND participant.person_id = ?
         AND m.is_closed = 0
       LIMIT 1`,
    )
    .get(employeeId);
  if (openMeetingParticipant) {
    throw new Error("Projektinterner Mitarbeiter kann nicht geloescht werden, solange er noch Teilnehmer in einer offenen Besprechung ist.");
  }

  const now = nowIso();
  db.prepare(
    `UPDATE project_local_firm_employees
     SET removed_at = ?, updated_at = ?
     WHERE id = ? AND removed_at IS NULL`,
  ).run(now, now, employeeId);

  return db.prepare(`SELECT * FROM project_local_firm_employees WHERE id = ?`).get(employeeId) || null;
}
