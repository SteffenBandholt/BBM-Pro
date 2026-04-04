import { getDb } from "../client.js";
import { createId } from "../../services/utils/id.js";
import { runMigrations } from "../migrations.js";
import { nowIso } from "../../services/utils/time.js";

function ensureProjectFirmsSchemaReady() {
  runMigrations();
}

export function listByProject(projectId) {
  ensureProjectFirmsSchemaReady();
  const db = getDb();
  return db
    .prepare(`SELECT * FROM project_firms WHERE project_id = ? AND removed_at IS NULL ORDER BY name`)
    .all(projectId);
}

export function getById(firmId) {
  ensureProjectFirmsSchemaReady();
  const db = getDb();
  return db.prepare(`SELECT * FROM project_firms WHERE id = ? AND removed_at IS NULL`).get(firmId) || null;
}

export function createFirm({ projectId, name, shortLabel = "", globalFirmId = null }) {
  ensureProjectFirmsSchemaReady();
  const db = getDb();
  const now = nowIso();
  const id = createId();
  db.prepare(
    `INSERT INTO project_firms (id, project_id, name, short_label, global_firm_id, removed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NULL, ?, ?)`,
  ).run(
    id,
    projectId,
    name?.trim() || "Firma",
    shortLabel?.trim() || name || "Firma",
    globalFirmId || null,
    now,
    now,
  );
  return getById(id);
}

export function updateFirm({ firmId, name, shortLabel = undefined }) {
  ensureProjectFirmsSchemaReady();
  const trimmedName = String(name || "").trim();
  if (!firmId) {
    throw new Error("Projektfirma fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Firmenname fehlt.");
  }

  const db = getDb();
  const currentFirm = getById(firmId);
  if (!currentFirm) {
    throw new Error("Projektfirma wurde nicht gefunden.");
  }

  const now = nowIso();
  db.prepare(
    `UPDATE project_firms
     SET name = ?, short_label = ?, updated_at = ?
     WHERE id = ? AND removed_at IS NULL`,
  ).run(
    trimmedName,
    shortLabel === undefined ? currentFirm.short_label : String(shortLabel || "").trim() || trimmedName,
    now,
    firmId,
  );

  return getById(firmId);
}

export function removeFirm(firmId) {
  ensureProjectFirmsSchemaReady();
  if (!firmId) {
    throw new Error("Projektfirma fehlt.");
  }

  const db = getDb();
  const currentFirm = getById(firmId);
  if (!currentFirm) {
    throw new Error("Projektfirma wurde nicht gefunden.");
  }

  const projectLocalEmployeeCount = db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM project_local_firm_employees
       WHERE project_firm_id = ? AND removed_at IS NULL`,
    )
    .get(firmId)?.count || 0;
  if (projectLocalEmployeeCount > 0) {
    throw new Error("Projektfirma kann nicht geloescht werden, solange noch projektinterne Mitarbeiter zugeordnet sind.");
  }

  const now = nowIso();
  db.prepare(
    `UPDATE project_firms
     SET removed_at = ?, updated_at = ?
     WHERE id = ? AND removed_at IS NULL`,
  ).run(now, now, firmId);

  const removedFirm = db.prepare(`SELECT * FROM project_firms WHERE id = ?`).get(firmId) || null;
  return removedFirm;
}
