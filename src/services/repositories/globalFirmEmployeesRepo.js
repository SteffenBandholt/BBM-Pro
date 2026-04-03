import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export function listByFirm(globalFirmId) {
  const db = readDb();
  const employees = db.globalFirmEmployees || [];
  return employees
    .filter((employee) => String(employee.global_firm_id) === String(globalFirmId) && !employee.removed_at)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

export function getById(employeeId) {
  const db = readDb();
  const employees = db.globalFirmEmployees || [];
  return employees.find((employee) => String(employee.id) === String(employeeId) && !employee.removed_at) || null;
}

export function createEmployee({ globalFirmId, name }) {
  const trimmedName = String(name || "").trim();
  if (!globalFirmId) {
    throw new Error("Firma fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Mitarbeitername fehlt.");
  }

  const db = readDb();
  const now = nowIso();
  const employee = {
    id: createId(),
    global_firm_id: globalFirmId,
    name: trimmedName,
    removed_at: null,
    created_at: now,
    updated_at: now,
  };

  db.globalFirmEmployees = [...(db.globalFirmEmployees || []), employee];
  writeDb(db);
  return employee;
}
