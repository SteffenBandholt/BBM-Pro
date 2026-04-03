import { getDb } from "../client.js";
import { runMigrations } from "../migrations.js";
import { nowIso } from "../../services/utils/time.js";
import { createId } from "../../services/utils/id.js";

function ensureFirmEmployeesSchemaReady() {
  runMigrations();
}

export function listByFirm(globalFirmId) {
  ensureFirmEmployeesSchemaReady();
  const db = getDb();
  return db
    .prepare(`SELECT * FROM global_firm_employees WHERE global_firm_id = ? AND removed_at IS NULL ORDER BY name`)
    .all(globalFirmId);
}

export function getById(employeeId) {
  ensureFirmEmployeesSchemaReady();
  const db = getDb();
  return db.prepare(`SELECT * FROM global_firm_employees WHERE id = ? AND removed_at IS NULL`).get(employeeId) || null;
}

export function createEmployee({ globalFirmId, name }) {
  ensureFirmEmployeesSchemaReady();
  const trimmedName = String(name || "").trim();
  if (!globalFirmId) {
    throw new Error("Firma fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Mitarbeitername fehlt.");
  }

  const db = getDb();
  const id = createId();
  const now = nowIso();
  db.prepare(
    `INSERT INTO global_firm_employees (id, global_firm_id, name, removed_at, created_at, updated_at)
     VALUES (?, ?, ?, NULL, ?, ?)`,
  ).run(id, globalFirmId, trimmedName, now, now);

  return db.prepare(`SELECT * FROM global_firm_employees WHERE id = ?`).get(id) || null;
}
