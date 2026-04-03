import { readDb, writeDb } from "../storage/localDb.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export function listByProjectFirm(projectFirmId) {
  const db = readDb();
  const items = db.projectFirmEmployees || [];
  return items
    .filter((item) => String(item.project_firm_id) === String(projectFirmId) && !item.removed_at)
    .sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")));
}

export function activateEmployee({ projectFirmId, globalEmployeeId }) {
  if (!projectFirmId) {
    throw new Error("Projektfirma fehlt.");
  }
  if (!globalEmployeeId) {
    throw new Error("Mitarbeiter fehlt.");
  }

  const db = readDb();
  const existing = (db.projectFirmEmployees || []).find(
    (item) =>
      String(item.project_firm_id) === String(projectFirmId) &&
      String(item.global_employee_id) === String(globalEmployeeId) &&
      !item.removed_at,
  );

  if (existing) {
    return existing;
  }

  const now = nowIso();
  const activation = {
    id: createId(),
    project_firm_id: projectFirmId,
    global_employee_id: globalEmployeeId,
    removed_at: null,
    created_at: now,
    updated_at: now,
  };

  db.projectFirmEmployees = [...(db.projectFirmEmployees || []), activation];
  writeDb(db);
  return activation;
}

export function deactivateEmployee({ projectFirmId, globalEmployeeId }) {
  const db = readDb();
  const now = nowIso();
  let updated = null;

  db.projectFirmEmployees = (db.projectFirmEmployees || []).map((item) => {
    if (
      String(item.project_firm_id) !== String(projectFirmId) ||
      String(item.global_employee_id) !== String(globalEmployeeId) ||
      item.removed_at
    ) {
      return item;
    }

    updated = {
      ...item,
      removed_at: now,
      updated_at: now,
    };
    return updated;
  });

  if (!updated) {
    return null;
  }

  writeDb(db);
  return updated;
}
