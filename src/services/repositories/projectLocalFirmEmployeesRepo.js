import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export function listByProjectFirm(projectFirmId) {
  const db = readDb();
  const items = db.projectLocalFirmEmployees || [];
  return items
    .filter((item) => String(item.project_firm_id) === String(projectFirmId) && !item.removed_at)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

export function createEmployee({ projectFirmId, name }) {
  const trimmedName = String(name || "").trim();
  if (!projectFirmId) {
    throw new Error("Projektfirma fehlt.");
  }
  if (!trimmedName) {
    throw new Error("Mitarbeitername fehlt.");
  }

  const db = readDb();
  const now = nowIso();
  const employee = {
    id: createId(),
    project_firm_id: projectFirmId,
    name: trimmedName,
    removed_at: null,
    created_at: now,
    updated_at: now,
  };

  db.projectLocalFirmEmployees = [...(db.projectLocalFirmEmployees || []), employee];
  writeDb(db);
  return employee;
}
